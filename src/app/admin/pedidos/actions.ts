"use server";

import { redirect } from "next/navigation";
import type { OrderStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/dal";
import {
  cancelOrderAsAdmin,
  clearReviewNote,
  setOrderStatus,
} from "@/lib/services/order-service";

// Solo estas transiciones son válidas desde el panel.
const allowedTransitions: Record<string, { from: OrderStatus; to: OrderStatus }> = {
  enviar: { from: "PAID", to: "SHIPPED" },
  entregar: { from: "SHIPPED", to: "DELIVERED" },
};

export async function advanceOrder(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  const action = formData.get("accion");
  if (typeof id !== "string" || typeof action !== "string") return;

  const transition = allowedTransitions[action];
  if (!transition) return;

  const ok = await setOrderStatus(id, transition.from, transition.to);
  redirect(`/admin/pedidos/${id}${ok ? "" : "?error=estado"}`);
}

export async function cancelOrder(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  const result = await cancelOrderAsAdmin(id);
  if (!result.ok) {
    redirect(`/admin/pedidos/${id}?error=${result.reason}`);
  }
  redirect(`/admin/pedidos/${id}?cancelado=${result.restocked ? "con-stock" : "1"}`);
}

export async function markReviewed(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await clearReviewNote(id);
  redirect(`/admin/pedidos/${id}`);
}
