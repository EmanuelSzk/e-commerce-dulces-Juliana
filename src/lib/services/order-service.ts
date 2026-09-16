import "server-only";
import { prisma } from "@/lib/db";
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
