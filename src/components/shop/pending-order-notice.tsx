import Link from "next/link";
import { restorePendingOrder } from "@/app/(shop)/carrito/actions";
import { formatDate, formatOrderNumber, formatPrice } from "@/lib/format";
import { buttonClass } from "@/components/ui/styles";
import { ClockIcon } from "./icons";

type PendingOrder = {
  id: string;
  createdAt: Date;
  total: { toString(): string };
  payment: { mpInitPoint: string | null } | null;
  items: {
    id: string;
    quantity: number;
    variant: { name: string; product: { name: string } };
  }[];
};

export function PendingOrderNotice({
  order,
  otherPendingCount,
  cartHasItems,
}: {
  order: PendingOrder;
  otherPendingCount: number;
  cartHasItems: boolean;
}) {
  return (
    <section
      aria-labelledby="pedido-pendiente"
      className="rounded-card border border-pink/40 bg-blush p-5 sm:p-6"
    >
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-berry">
        <ClockIcon />
        Pedido pendiente de pago · no es parte del carrito
      </p>
      <h2 id="pedido-pendiente" className="mt-2 font-serif text-3xl text-ink">
        Tenés un pedido esperando el pago
      </h2>
      <p className="mt-2 max-w-[62ch] text-[14px] font-light leading-relaxed text-cocoa">
        Cuando fuiste a pagar, estos productos salieron del carrito y se convirtieron en
        el pedido {formatOrderNumber(order.id)}. Todavía no se cobró, y el stock no queda
        reservado hasta que el pago se confirme.
      </p>

      <div className="mt-4 rounded-tile bg-cream/70 px-4 py-3">
        <p className="text-[12.5px] font-light text-taupe">
          {formatOrderNumber(order.id)} · {formatDate(order.createdAt)}
        </p>
        <ul className="mt-1.5 space-y-0.5 text-sm text-ink">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity} × {item.variant.product.name} — {item.variant.name}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm">
          <span className="font-light text-cocoa">Total </span>
          <span className="font-semibold text-ink">{formatPrice(order.total.toString())}</span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {order.payment?.mpInitPoint && (
          <a href={order.payment.mpInitPoint} className={buttonClass("primary", "md")}>
            Pagar ahora
          </a>
        )}
        <form action={restorePendingOrder}>
          <input type="hidden" name="orderId" value={order.id} />
          <button type="submit" className={buttonClass("outline", "md")}>
            Volver a editar en el carrito
          </button>
        </form>
        <Link href="/cuenta" className="text-sm text-berry hover:underline">
          {otherPendingCount > 0
            ? `Ver ${otherPendingCount === 1 ? "el otro pedido pendiente" : `los otros ${otherPendingCount} pedidos pendientes`} en Mi cuenta`
            : "Ver en Mi cuenta"}
        </Link>
      </div>

      <p className="mt-3 text-[12.5px] font-light text-taupe">
        Si lo volvés al carrito, este pedido se cancela
        {cartHasItems ? " y sus productos se suman a los que ya tenés." : "."}
      </p>
    </section>
  );
}
