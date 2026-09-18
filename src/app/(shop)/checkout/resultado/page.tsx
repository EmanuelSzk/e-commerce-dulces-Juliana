import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getOrderForUser } from "@/lib/services/order-service";
import { formatOrderNumber, formatPrice } from "@/lib/format";
import { deliveryMethodLabels, orderStatusLabels } from "@/lib/order-labels";
import { CheckoutSteps } from "@/components/shop/checkout-steps";
import { buttonClass } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Resultado del pago" };

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
    <div className="mx-auto max-w-lg py-4">
      <CheckoutSteps current={3} />
      <h1 className="mt-6 font-serif text-5xl leading-tight text-ink">{outcome.title}</h1>
      <p className="mt-3 text-[15px] font-light leading-relaxed text-cocoa">{outcome.body}</p>

      {order && (
        <dl className="mt-6 grid gap-2.5 rounded-card bg-surface p-5 text-sm font-light text-cocoa">
          <div className="flex justify-between">
            <dt>Pedido</dt>
            <dd className="font-medium text-ink">{formatOrderNumber(order.id)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Estado</dt>
            <dd className="font-medium text-ink">{orderStatusLabels[order.status]}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Entrega</dt>
            <dd className="font-medium text-ink">{deliveryMethodLabels[order.deliveryMethod]}</dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between border-t border-ink/10 pt-3">
            <dt className="font-medium text-ink">Total</dt>
            <dd className="text-2xl font-semibold text-ink">{formatPrice(order.total.toString())}</dd>
          </div>
        </dl>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {canRetry && (
          <a href={order.payment!.mpInitPoint!} className={buttonClass("primary", "md")}>
            Reintentar el pago
          </a>
        )}
        <Link href="/cuenta" className={buttonClass("outline", "md")}>
          Ver mis pedidos
        </Link>
        <Link href="/productos" className={buttonClass("outline", "md")}>
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
