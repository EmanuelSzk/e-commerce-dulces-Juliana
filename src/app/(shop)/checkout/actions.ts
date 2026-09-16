"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";
import { requireUser } from "@/lib/dal";
import { calculateTotals } from "@/lib/pricing";
import { createCheckoutPreference } from "@/lib/mercadopago";
import {
  normalizeCartLines,
  readCart,
  resolveCart,
  writeCart,
} from "@/lib/services/cart-service";
import {
  attachPaymentLink,
  cancelOrder,
  createPendingOrder,
} from "@/lib/services/order-service";
import { getStoreSettings } from "@/lib/services/settings-service";

export type CheckoutFormState =
  | { errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

const CheckoutSchema = z
  .object({
    deliveryMethod: z.enum(["DELIVERY", "PICKUP"], {
      error: "Elegí envío a domicilio o retiro en el local.",
    }),
    contactName: z.string().trim().min(2, { error: "Ingresá tu nombre." }),
    contactPhone: z
      .string()
      .trim()
      .regex(/^[\d\s()+-]{6,20}$/, { error: "Ingresá un teléfono válido." }),
    shippingAddress: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      data.deliveryMethod === "PICKUP" || (data.shippingAddress ?? "").length >= 5,
    { path: ["shippingAddress"], error: "Ingresá la dirección de entrega." },
  );

export async function createOrder(
  _state: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  const profile = await requireUser();

  const fields = CheckoutSchema.safeParse({
    deliveryMethod: formData.get("deliveryMethod"),
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    // The address input isn't rendered for pickup, so it may be absent.
    shippingAddress: formData.get("shippingAddress") ?? undefined,
  });

  if (!fields.success) {
    return { errors: z.flattenError(fields.error).fieldErrors };
  }

  const { deliveryMethod, contactName, contactPhone, shippingAddress } =
    fields.data;

  // Never trust what the checkout page showed: re-read cart, prices and
  // stock right before creating the order.
  const cart = await resolveCart(await readCart());

  if (cart.subtotal === 0) {
    redirect("/carrito");
  }
  if (cart.hasIssues) {
    await writeCart(normalizeCartLines(cart.lines));
    redirect("/carrito?ajustado=1");
  }

  const settings = await getStoreSettings();
  const totals = calculateTotals(cart.subtotal, deliveryMethod, settings);

  const order = await createPendingOrder({
    userId: profile.id,
    deliveryMethod,
    contactName,
    contactPhone,
    shippingAddress: deliveryMethod === "DELIVERY" ? shippingAddress! : null,
    lines: cart.lines,
    ...totals,
  });

  const requestHeaders = await headers();
  const baseUrl =
    requestHeaders.get("origin") ?? `http://${requestHeaders.get("host")}`;

  let payment;
  try {
    payment = await createCheckoutPreference({
      orderId: order.id,
      payerEmail: profile.email,
      items: cart.lines.map((line) => ({
        id: line.variantId,
        title: `${line.productName} — ${line.variantName}`,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
      shippingCost: totals.shippingCost,
      baseUrl,
    });
  } catch (error) {
    console.error("No se pudo crear la preferencia de Mercado Pago", error);
    await cancelOrder(order.id);
    return {
      message:
        "No pudimos conectar con Mercado Pago. Tu carrito sigue guardado: probá de nuevo en unos minutos.",
    };
  }

  await attachPaymentLink(order.id, payment.preferenceId, payment.initPoint);

  // The cart becomes this order. If the customer abandons the payment, they can
  // resume it from "Mi cuenta" instead of paying twice for a still-full cart.
  await writeCart([]);

  redirect(payment.initPoint);
}
