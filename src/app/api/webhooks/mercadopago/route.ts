import type { NextRequest } from "next/server";
import { InvalidWebhookSignatureError, MercadoPagoError } from "mercadopago";
import { getPayment, verifyWebhookSignature } from "@/lib/mercadopago";
import { applyPaymentUpdate } from "@/lib/services/payment-service";

// Mercado Pago retries any notification that doesn't get a 2xx. Return 200 for
// things a retry can't fix, and 5xx only for transient failures.
export async function POST(request: NextRequest) {
  const query = request.nextUrl.searchParams;

  let body: { type?: string; data?: { id?: string | number } } = {};
  try {
    body = await request.json();
  } catch {
    // Some notifications carry everything in the query string.
  }

  const type = query.get("type") ?? body.type ?? null;
  const dataId =
    query.get("data.id") ?? (body.data?.id != null ? String(body.data.id) : null);

  try {
    verifyWebhookSignature({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      console.warn("Webhook de Mercado Pago con firma inválida", {
        reason: error.reason,
        requestId: error.requestId,
      });
      return new Response(null, { status: 401 });
    }
    console.error("No se pudo verificar el webhook de Mercado Pago", error);
    return new Response(null, { status: 500 });
  }

  if (type !== "payment" || !dataId) {
    return new Response(null, { status: 200 });
  }

  let payment;
  try {
    payment = await getPayment(dataId);
  } catch (error) {
    if (error instanceof MercadoPagoError && error.status === 404) {
      console.warn("Webhook de Mercado Pago para un pago inexistente", { dataId });
      return new Response(null, { status: 200 });
    }
    console.error("No se pudo consultar el pago en Mercado Pago", { dataId, error });
    return new Response(null, { status: 500 });
  }

  try {
    const result = await applyPaymentUpdate(payment);
    console.info("Webhook de Mercado Pago procesado", { dataId, ...result });
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("No se pudo aplicar el pago", { dataId, error });
    return new Response(null, { status: 500 });
  }
}
