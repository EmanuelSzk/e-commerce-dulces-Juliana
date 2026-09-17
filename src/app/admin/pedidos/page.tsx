import Link from "next/link";
import type { OrderStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/dal";
import { getOrdersForAdmin } from "@/lib/services/order-service";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { deliveryMethodLabels, orderStatusLabels } from "@/lib/order-labels";

const filters = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendientes de pago" },
  { value: "PAID", label: "Pagados" },
  { value: "SHIPPED", label: "Enviados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

export default async function AdminPedidosPage({
  searchParams,
}: PageProps<"/admin/pedidos">) {
  await requireAdmin();

  const { estado, revisar } = await searchParams;
  const status =
    typeof estado === "string" && estado in orderStatusLabels
      ? (estado as OrderStatus)
      : undefined;
  const onlyToReview = revisar === "1";

  const orders = await getOrdersForAdmin({ status, onlyToReview });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pedidos</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = !onlyToReview && (status ?? "") === filter.value;
          return (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/pedidos?estado=${filter.value}` : "/admin/pedidos"}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                active ? "border-black bg-black text-white" : "border-black/15"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
        <Link
          href="/admin/pedidos?revisar=1"
          className={`rounded-full border px-3 py-1.5 text-sm ${
            onlyToReview ? "border-amber-500 bg-amber-100" : "border-black/15"
          }`}
        >
          Para revisar
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-black/60">No hay pedidos con ese filtro.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/pedidos/${order.id}`}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-black/10 p-3 hover:bg-black/5"
              >
                <span className="font-medium">{formatOrderNumber(order.id)}</span>
                <span className="text-sm text-black/60">{formatDate(order.createdAt)}</span>
                <span className="text-sm">{order.user.name}</span>
                <span className="text-sm text-black/60">
                  {deliveryMethodLabels[order.deliveryMethod]}
                </span>
                {order.reviewNote && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    Revisar
                  </span>
                )}
                <div className="flex-1" />
                <span className="text-sm">{orderStatusLabels[order.status]}</span>
                <span className="font-medium">{formatPrice(order.total.toString())}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
