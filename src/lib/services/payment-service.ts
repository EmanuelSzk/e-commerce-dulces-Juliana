import "server-only";
import { prisma } from "@/lib/db";
import type { PaymentStatus, Prisma } from "@/generated/prisma/client";

// The subset of Mercado Pago's payment object this service relies on.
export type MercadoPagoPayment = {
  id?: number | string;
  status?: string;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
};

export type PaymentUpdateResult =
  | { outcome: "processed"; status: PaymentStatus; notes: string[] }
  | { outcome: "ignored"; reason: string };

const statusMap: Record<string, PaymentStatus> = {
  approved: "APPROVED",
  pending: "IN_PROCESS",
  in_process: "IN_PROCESS",
  authorized: "IN_PROCESS",
  in_mediation: "IN_PROCESS",
  rejected: "REJECTED",
  cancelled: "REJECTED",
  refunded: "REFUNDED",
  charged_back: "REFUNDED",
};

function mergeReviewNote(existing: string | null, notes: string[]) {
  const lines = existing ? existing.split("\n") : [];
  for (const note of notes) {
    if (!lines.includes(note)) lines.push(note);
  }
  return lines.join("\n");
}

function toJson(payment: MercadoPagoPayment): Prisma.InputJsonValue {
  // The SDK attaches HTTP metadata under `api_response`; keep only the payment.
  const copy: Record<string, unknown> = { ...payment };
  delete copy.api_response;
  return JSON.parse(JSON.stringify(copy));
}

export async function applyPaymentUpdate(
  payment: MercadoPagoPayment,
): Promise<PaymentUpdateResult> {
  const paymentId = payment.id != null ? String(payment.id) : null;
  const orderId = payment.external_reference;
  const status = payment.status ? statusMap[payment.status] : undefined;

  if (!paymentId || !orderId) {
    return { outcome: "ignored", reason: "pago sin id o sin external_reference" };
  }
  if (!status) {
    return { outcome: "ignored", reason: `estado desconocido: ${payment.status}` };
  }

  return prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          payment: true,
          items: { include: { variant: { include: { product: true } } } },
        },
      });

      if (!order || !order.payment) {
        return { outcome: "ignored", reason: `no existe el pedido ${orderId}` };
      }

      const stored = order.payment;
      const isAnotherPayment =
        stored.mpPaymentId !== null && stored.mpPaymentId !== paymentId;
      const notes: string[] = [];

      if (stored.status === "APPROVED" && isAnotherPayment) {
        // A second attempt for an order that's already paid. Late news about an
        // earlier failed attempt is noise; a second approval means paying twice.
        if (status !== "APPROVED") {
          return { outcome: "ignored", reason: "aviso de otro intento de pago" };
        }
        const note = `Pago duplicado: el pedido ya estaba pagado con el pago ${stored.mpPaymentId} y se aprobó otro pago (${paymentId}).`;
        await tx.order.update({
          where: { id: order.id },
          data: { reviewNote: mergeReviewNote(order.reviewNote, [note]) },
        });
        return { outcome: "processed", status, notes: [note] };
      }

      if (
        !isAnotherPayment &&
        ((stored.status === "APPROVED" &&
          (status === "IN_PROCESS" || status === "REJECTED")) ||
          (stored.status === "REFUNDED" && status !== "REFUNDED"))
      ) {
        return { outcome: "ignored", reason: "aviso desactualizado" };
      }

      await tx.payment.update({
        where: { id: stored.id },
        data: { mpPaymentId: paymentId, status, rawPayload: toJson(payment) },
      });

      if (status === "APPROVED") {
        const total = Number(order.total);
        const amountMatches =
          payment.currency_id === "ARS" &&
          typeof payment.transaction_amount === "number" &&
          Math.abs(payment.transaction_amount - total) < 0.01;

        if (!amountMatches) {
          notes.push(
            `El monto pagado no coincide con el pedido: se pagó ${payment.transaction_amount} ${payment.currency_id} y el total es ${total} ARS. No se marcó como pagado.`,
          );
        } else {
          // Conditional on PENDING: concurrent duplicate notifications lock the
          // same row and only one of them wins, so stock is taken exactly once.
          const transitioned = await tx.order.updateMany({
            where: { id: order.id, status: "PENDING" },
            data: { status: "PAID", paidAt: new Date() },
          });

          if (transitioned.count === 1) {
            for (const item of order.items) {
              const decremented = await tx.productVariant.updateMany({
                where: { id: item.variantId, stock: { gte: item.quantity } },
                data: { stock: { decrement: item.quantity } },
              });

              if (decremented.count === 0) {
                const variant = await tx.productVariant.findUnique({
                  where: { id: item.variantId },
                  select: { stock: true },
                });
                await tx.productVariant.update({
                  where: { id: item.variantId },
                  data: { stock: 0 },
                });
                notes.push(
                  `Stock insuficiente: ${item.variant.product.name} — ${item.variant.name} (pedidas ${item.quantity}, había ${variant?.stock ?? 0}).`,
                );
              }
            }
          } else if (order.status === "CANCELLED") {
            notes.push(`Pago aprobado (${paymentId}) para un pedido cancelado.`);
          }
        }
      }

      if (status === "REFUNDED") {
        const kind = payment.status === "charged_back" ? "contracargo" : "devolución";
        notes.push(
          `Mercado Pago informó una ${kind} del pago ${paymentId}. Revisar el pedido y el stock.`,
        );
      }

      if (notes.length > 0) {
        await tx.order.update({
          where: { id: order.id },
          data: { reviewNote: mergeReviewNote(order.reviewNote, notes) },
        });
      }

      return { outcome: "processed", status, notes };
    },
    { timeout: 15000 },
  );
}
