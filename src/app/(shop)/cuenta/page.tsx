import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getOrdersForUser } from "@/lib/services/order-service";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { deliveryMethodLabels, orderStatusLabels } from "@/lib/order-labels";
import { logout } from "./actions";

export default async function CuentaPage() {
  const profile = await requireUser();
  const orders = await getOrdersForUser(profile.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Mi cuenta</h1>

      <dl className="mt-6 space-y-3 rounded-lg border border-black/10 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-black/60">Nombre</dt>
          <dd>{profile.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-black/60">Email</dt>
          <dd>{profile.email}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-black/60">Tipo de cuenta</dt>
          <dd>{profile.role === "ADMIN" ? "Administradora" : "Clienta"}</dd>
        </div>
      </dl>

      <h2 className="mt-10 text-lg font-semibold">Mis pedidos</h2>

      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-black/60">
          Todavía no hiciste pedidos.{" "}
          <Link href="/productos" className="underline">
            Ver productos
          </Link>
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-black/10 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-medium">{formatOrderNumber(order.id)}</p>
                  <p className="text-xs text-black/50">
                    {formatDate(order.createdAt)} ·{" "}
                    {deliveryMethodLabels[order.deliveryMethod]}
                  </p>
                </div>
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs">
                  {orderStatusLabels[order.status]}
                </span>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-black/70">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.variant.product.name} —{" "}
                    {item.variant.name}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-medium">
                  Total {formatPrice(order.total.toString())}
                </p>
                {order.status === "PENDING" && order.payment?.mpInitPoint && (
                  <a
                    href={order.payment.mpInitPoint}
                    className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white"
                  >
                    Pagar
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={logout} className="mt-10">
        <button
          type="submit"
          className="rounded-full border border-black/15 px-4 py-2 text-sm"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
