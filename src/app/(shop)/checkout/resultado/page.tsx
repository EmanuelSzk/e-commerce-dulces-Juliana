import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getOrderForUser } from "@/lib/services/order-service";
import { formatOrderNumber, formatPrice } from "@/lib/format";
import { deliveryMethodLabels, orderStatusLabels } from "@/lib/order-labels";

const outcomes = {
  confirmed: {
    title: "¡Gracias por tu compra!",
    body: "Tu pago está confirmado. Podés seguir el estado del pedido desde tu cuenta.",
  },
  confirming: {
    title: "¡Gracias por tu compra!",
    body: "Estamos esperando la confirmación de Mercado Pago. Actualizá la página en unos segundos para ver tu pedido confirmado.",
  },
  pending: {
    title: "Tu pago está pendiente",
    body: "Mercado Pago todavía está procesando el pago. Te avisamos en tu cuenta cuando se acredite.",
  },
  failed: {
    title: "El pago no se completó",
    body: "No se realizó ningún cobro. Podés intentarlo de nuevo.",
  },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResultadoPage({
  searchParams,
}: PageProps<"/checkout/resultado">) {
  const profile = await requireUser();
  const params = await searchParams;

  // These query params come from the browser and can be edited, so they only
  // pick the wording. The order's real status (set by the payment webhook) wins.
  const status = firstValue(params.collection_status) ?? firstValue(params.status);
  const orderId = firstValue(params.external_reference);
  const order = orderId ? await getOrderForUser(orderId, profile.id) : null;

  const outcome =
    order && order.status !== "PENDING" && order.status !== "CANCELLED"
      ? outcomes.confirmed
      : status === "approved"
        ? outcomes.confirming
        : status === "pending" || status === "in_process"
          ? outcomes.pending
          : outcomes.failed;

  const canRetry =
    outcome === outcomes.failed &&
    order?.status === "PENDING" &&
    order.payment?.mpInitPoint;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">{outcome.title}</h1>
      <p className="mt-2 text-black/70">{outcome.body}</p>

      {order && (
        <dl className="mt-6 space-y-2 rounded-lg border border-black/10 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-black/60">Pedido</dt>
            <dd>{formatOrderNumber(order.id)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/60">Estado</dt>
            <dd>{orderStatusLabels[order.status]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/60">Entrega</dt>
            <dd>{deliveryMethodLabels[order.deliveryMethod]}</dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(order.total.toString())}</dd>
          </div>
        </dl>
      )}

      <div className="mt-6 flex gap-3">
        {canRetry && (
          <a
            href={order.payment!.mpInitPoint!}
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Reintentar el pago
          </a>
        )}
        <Link
          href="/cuenta"
          className="rounded-full border border-black/15 px-4 py-2 text-sm"
        >
          Ver mis pedidos
        </Link>
      </div>
    </div>
  );
}
