import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { getOrderByIdForAdmin } from "@/lib/services/order-service";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { deliveryMethodLabels, orderStatusLabels } from "@/lib/order-labels";
import { advanceOrder, cancelOrder, markReviewed } from "../actions";

const notices: Record<string, { text: string; tone: "ok" | "error" }> = {
  estado: { text: "El pedido ya había cambiado de estado. Revisá cómo quedó.", tone: "error" },
  entregado: { text: "Un pedido entregado no se puede cancelar.", tone: "error" },
  cambio: { text: "El pedido cambió mientras lo cancelabas. Revisá cómo quedó.", tone: "error" },
  "no-existe": { text: "No encontramos ese pedido.", tone: "error" },
  "1": { text: "Pedido cancelado.", tone: "ok" },
  "con-stock": { text: "Pedido cancelado y stock devuelto al catálogo.", tone: "ok" },
};

export default async function AdminPedidoPage({
  params,
  searchParams,
}: PageProps<"/admin/pedidos/[id]">) {
  await requireAdmin();

  const { id } = await params;
  const { error, cancelado } = await searchParams;
  const order = await getOrderByIdForAdmin(id);

  if (!order) notFound();

  const noticeKey = typeof error === "string" ? error : typeof cancelado === "string" ? cancelado : null;
  const notice = noticeKey ? notices[noticeKey] : null;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/pedidos" className="text-sm underline">
        ← Volver a pedidos
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">
        Pedido {formatOrderNumber(order.id)}
      </h1>
      <p className="mt-1 text-sm text-black/60">
        {formatDate(order.createdAt)} · {orderStatusLabels[order.status]}
        {order.paidAt && ` · pagado ${formatDate(order.paidAt)}`}
      </p>

      {notice && (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            notice.tone === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      {order.reviewNote && (
        <div className="mt-4 rounded-lg border border-amber-400 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">Para revisar</p>
          <p className="mt-1 whitespace-pre-line text-sm text-amber-900">
            {order.reviewNote}
          </p>
          <form action={markReviewed} className="mt-3">
            <input type="hidden" name="id" value={order.id} />
            <button type="submit" className="text-sm underline">
              Marcar como revisado
            </button>
          </form>
        </div>
      )}

      <section className="mt-6 rounded-lg border border-black/10 p-4">
        <h2 className="font-medium">Contacto y entrega</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-black/60">Clienta</dt>
            <dd>{order.user.name} · {order.user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-black/60">A nombre de</dt>
            <dd>{order.contactName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-black/60">Teléfono</dt>
            <dd>{order.contactPhone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-black/60">Entrega</dt>
            <dd>{deliveryMethodLabels[order.deliveryMethod]}</dd>
          </div>
          {order.shippingAddress && (
            <div className="flex justify-between gap-4">
              <dt className="text-black/60">Dirección</dt>
              <dd>{order.shippingAddress}, Posadas</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-4 rounded-lg border border-black/10 p-4">
        <h2 className="font-medium">Productos</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.quantity} × {item.variant.product.name} — {item.variant.name}
              </span>
              <span>{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-black/10 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-black/60">Subtotal</dt>
            <dd>{formatPrice(order.subtotal.toString())}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/60">Envío</dt>
            <dd>
              {Number(order.shippingCost) === 0
                ? "Gratis"
                : formatPrice(order.shippingCost.toString())}
            </dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.total.toString())}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-lg border border-black/10 p-4 text-sm">
        <h2 className="font-medium">Pago</h2>
        <p className="mt-2 text-black/70">
          Estado en Mercado Pago: {order.payment?.status ?? "sin datos"}
          {order.payment?.mpPaymentId && ` · id ${order.payment.mpPaymentId}`}
        </p>
      </section>

      <section className="mt-6 flex flex-wrap gap-3">
        {order.status === "PAID" && (
          <form action={advanceOrder}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="accion" value="enviar" />
            <button type="submit" className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
              Marcar como enviado
            </button>
          </form>
        )}

        {order.status === "SHIPPED" && (
          <form action={advanceOrder}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="accion" value="entregar" />
            <button type="submit" className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
              Marcar como entregado
            </button>
          </form>
        )}

        {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
          <form action={cancelOrder}>
            <input type="hidden" name="id" value={order.id} />
            <button type="submit" className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
              Cancelar pedido
              {(order.status === "PAID" || order.status === "SHIPPED") && " y devolver stock"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
