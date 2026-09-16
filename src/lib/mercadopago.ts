import "server-only";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export type CheckoutPreferenceInput = {
  orderId: string;
  payerEmail: string;
  items: { id: string; title: string; quantity: number; unitPrice: number }[];
  shippingCost: number;
  baseUrl: string;
};

export async function createCheckoutPreference(input: CheckoutPreferenceInput) {
  const returnUrl = `${input.baseUrl}/checkout/resultado`;

  const items = input.items.map((item) => ({
    id: item.id,
    title: item.title,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: "ARS",
  }));

  if (input.shippingCost > 0) {
    items.push({
      id: "envio",
      title: "Envío a domicilio",
      quantity: 1,
      unit_price: input.shippingCost,
      currency_id: "ARS",
    });
  }

  const preference = await new Preference(client).create({
    body: {
      items,
      // Lets the payment webhook (Fase 4) find the order a payment belongs to.
      external_reference: input.orderId,
      payer: { email: input.payerEmail },
      back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
      // Mercado Pago rejects auto_return when back_urls point to plain http
      // (e.g. localhost): "auto_return invalid. back_url.success must be defined".
      ...(input.baseUrl.startsWith("https://") ? { auto_return: "approved" } : {}),
    },
  });

  if (!preference.id || !preference.init_point) {
    throw new Error("Mercado Pago no devolvió el link de pago.");
  }

  return { preferenceId: preference.id, initPoint: preference.init_point };
}
