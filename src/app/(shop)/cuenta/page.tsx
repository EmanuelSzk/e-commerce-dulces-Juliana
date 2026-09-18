import type { Metadata } from "next";
import Link from "next/link";
import type { OrderStatus } from "@/generated/prisma/client";
import { requireUser } from "@/lib/dal";
import { getOrdersForUser } from "@/lib/services/order-service";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { deliveryMethodLabels, orderStatusLabels } from "@/lib/order-labels";
import { badgeClass, buttonClass } from "@/components/ui/styles";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Mi cuenta" };

const statusTone: Record<OrderStatus, "blush" | "ink" | "sand"> = {
  PENDING: "blush",
  PAID: "ink",
  SHIPPED: "ink",
  DELIVERED: "sand",
  CANCELLED: "sand",
};

export default async function CuentaPage() {
  const profile = await requireUser();
  const orders = await getOrdersForUser(profile.id);

  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-5xl text-ink">Hola, {profile.name}</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-taupe hover:underline">
            Cerrar sesión
          </button>
        </form>
      </div>
      <p className="mt-1 text-sm font-light text-taupe">
        {profile.email}
        {profile.role === "ADMIN" && " · Administradora"}
      </p>

      <h2 className="mt-10 font-serif text-3xl text-ink">Mis pedidos</h2>

      {orders.length === 0 ? (
        <div className="mt-4 rounded-card bg-surface p-6">
          <p className="text-cocoa">Todavía no hiciste pedidos.</p>
          <Link href="/productos" className={buttonClass("primary", "md", "mt-4")}>
            Ver el catálogo
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-card bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">Pedido {formatOrderNumber(order.id)}</p>
                  <p className="text-[12.5px] font-light text-taupe">
                    {formatDate(order.createdAt)} · {deliveryMethodLabels[order.deliveryMethod]}
                  </p>
                </div>
                <span className={badgeClass(statusTone[order.status])}>
                  {orderStatusLabels[order.status]}
                </span>
              </div>

              <ul className="mt-3 space-y-1 text-sm font-light text-cocoa">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.variant.product.name} — {item.variant.name}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-semibold text-ink">
                  {formatPrice(order.total.toString())}
                </p>
                {order.status === "PENDING" && order.payment?.mpInitPoint && (
                  <a href={order.payment.mpInitPoint} className={buttonClass("primary", "md")}>
                    Pagar
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
