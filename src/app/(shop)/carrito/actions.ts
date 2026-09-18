"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { hasPaymentInProgress } from "@/lib/mercadopago";
import {
  addItemsToCart,
  normalizeCartLines,
  readCart,
  resolveCart,
  writeCart,
  type CartItem,
} from "@/lib/services/cart-service";
import {
  cancelPendingOrderForUser,
  getOrderForUser,
} from "@/lib/services/order-service";

export type AddToCartState = { ok: boolean; message: string } | undefined;

const AddToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

const UpdateCartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(99),
});

async function getSellableStock(variantId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant || !variant.active || !variant.product.active) return 0;
  return variant.stock;
}

function setQuantity(cart: CartItem[], variantId: string, quantity: number) {
  if (quantity <= 0) {
    return cart.filter((item) => item.variantId !== variantId);
  }
  if (!cart.some((item) => item.variantId === variantId)) {
    return [...cart, { variantId, quantity }];
  }
  return cart.map((item) =>
    item.variantId === variantId ? { variantId, quantity } : item,
  );
}

export async function addToCart(
  _state: AddToCartState,
  formData: FormData,
): Promise<AddToCartState> {
  const fields = AddToCartSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });

  if (!fields.success) {
    return { ok: false, message: "Elegí una presentación y una cantidad válida." };
  }

  const { variantId, quantity } = fields.data;
  const stock = await getSellableStock(variantId);

  if (stock === 0) {
    return { ok: false, message: "Esa presentación está agotada." };
  }

  const cart = await readCart();
  const inCart = cart.find((item) => item.variantId === variantId)?.quantity ?? 0;

  if (inCart >= stock) {
    return {
      ok: false,
      message: `Ya tenés en el carrito todas las unidades disponibles (${stock}).`,
    };
  }

  const newQuantity = Math.min(inCart + quantity, stock);
  await writeCart(setQuantity(cart, variantId, newQuantity));

  if (newQuantity < inCart + quantity) {
    return {
      ok: true,
      message: `Solo quedaban ${stock} unidades: agregamos las disponibles.`,
    };
  }

  return { ok: true, message: "Agregado al carrito." };
}

export async function updateCartItem(formData: FormData) {
  const fields = UpdateCartItemSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  if (!fields.success) return;

  const { variantId, quantity } = fields.data;
  const stock = await getSellableStock(variantId);
  const cart = await readCart();

  await writeCart(setQuantity(cart, variantId, Math.min(quantity, stock)));
}

export async function removeCartItem(formData: FormData) {
  const variantId = formData.get("variantId");
  if (typeof variantId !== "string") return;

  const cart = await readCart();
  await writeCart(cart.filter((item) => item.variantId !== variantId));
}

// Accepts any pending stock adjustments before moving on, so the checkout
// starts from a cart that matches what can actually be sold.
export async function proceedToCheckout() {
  const cart = await resolveCart(await readCart());
  await writeCart(normalizeCartLines(cart.lines));
  redirect("/checkout");
}

// "Volver a editar en el carrito": cancela el pedido pendiente y devuelve sus
// productos al carrito, así nunca hay dos pedidos armados con lo mismo.
export async function restorePendingOrder(formData: FormData) {
  const profile = await requireUser();
  const orderId = formData.get("orderId");
  if (typeof orderId !== "string") redirect("/carrito");

  const order = await getOrderForUser(orderId, profile.id);
  if (!order || order.status !== "PENDING") redirect("/carrito");

  // If the customer already paid (or left a cash voucher pending), cancelling
  // would leave a charge without an order. When Mercado Pago can't be reached,
  // err on the safe side and leave the order untouched.
  let inProgress = true;
  try {
    inProgress = await hasPaymentInProgress(order.id);
  } catch (error) {
    console.error("No se pudo consultar el pago antes de cancelar", { orderId, error });
    redirect("/carrito?pedido=sin-verificar");
  }
  if (inProgress) redirect("/carrito?pedido=en-proceso");

  const cancelled = await cancelPendingOrderForUser(order.id, profile.id);
  if (!cancelled) redirect("/carrito");

  await addItemsToCart(
    order.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
  );
  redirect("/carrito?pedido=restaurado");
}
