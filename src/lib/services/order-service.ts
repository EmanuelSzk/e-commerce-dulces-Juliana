import "server-only";
import { prisma } from "@/lib/db";
import type { OrderStatus } from "@/generated/prisma/client";
import type { DeliveryMethod } from "@/lib/pricing";
import type { CartLine } from "./cart-service";

export type NewOrderInput = {
  userId: string;
  deliveryMethod: DeliveryMethod;
  contactName: string;
  contactPhone: string;
  shippingAddress: string | null;
  lines: CartLine[];
  subtotal: number;
  shippingCost: number;
  total: number;
};

// Nested create: the order, its items and the payment record are written
// atomically, so there's never an order without items or without a payment row.
export function createPendingOrder(input: NewOrderInput) {
  return prisma.order.create({
    data: {
      userId: input.userId,
      deliveryMethod: input.deliveryMethod,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      shippingAddress: input.shippingAddress,
      subtotal: input.subtotal,
      shippingCost: input.shippingCost,
      total: input.total,
      items: {
        create: input.lines
          .filter((line) => line.quantity > 0)
          .map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          })),
      },
      payment: { create: {} },
    },
  });
}

export function attachPaymentLink(
  orderId: string,
  preferenceId: string,
  initPoint: string,
) {
  return prisma.payment.update({
    where: { orderId },
    data: { mpPreferenceId: preferenceId, mpInitPoint: initPoint },
  });
}

export function cancelOrder(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
}

const orderDetails = {
  payment: true,
  items: { include: { variant: { include: { product: true } } } },
} as const;

export function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: orderDetails,
    orderBy: { createdAt: "desc" },
  });
}

// Scoped by user: someone who edits the order id in the URL can't see
// another customer's order.
export function getOrderForUser(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderDetails,
  });
}

const adminOrderDetails = { ...orderDetails, user: true } as const;

export function getOrdersForAdmin(filters: {
  status?: OrderStatus;
  onlyToReview?: boolean;
}) {
  return prisma.order.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.onlyToReview ? { reviewNote: { not: null } } : {}),
    },
    include: adminOrderDetails,
    orderBy: { createdAt: "desc" },
  });
}

export function getOrderByIdForAdmin(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: adminOrderDetails,
  });
}

// Conditioned on the expected status, like the payment webhook: two clicks at
// once can't apply the same transition twice.
export async function setOrderStatus(
  orderId: string,
  from: OrderStatus,
  to: OrderStatus,
) {
  const changed = await prisma.order.updateMany({
    where: { id: orderId, status: from },
    data: { status: to },
  });
  return changed.count === 1;
}

export type CancelResult =
  | { ok: true; restocked: boolean }
  | { ok: false; reason: "no-existe" | "entregado" | "cambio" };

// Cancelling an order whose stock was already taken (paid or shipped) returns
// those units to the catalogue.
export async function cancelOrderAsAdmin(orderId: string): Promise<CancelResult> {
  return prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) return { ok: false, reason: "no-existe" } as const;
      if (order.status === "CANCELLED") return { ok: true, restocked: false } as const;
      if (order.status === "DELIVERED") return { ok: false, reason: "entregado" } as const;

      const stockWasTaken = order.status === "PAID" || order.status === "SHIPPED";

      const changed = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status: "CANCELLED" },
      });
      if (changed.count !== 1) return { ok: false, reason: "cambio" } as const;

      if (stockWasTaken) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return { ok: true, restocked: stockWasTaken } as const;
    },
    { timeout: 15000 },
  );
}

export function clearReviewNote(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { reviewNote: null },
  });
}
