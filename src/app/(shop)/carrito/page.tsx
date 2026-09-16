import Link from "next/link";
import { readCart, resolveCart } from "@/lib/services/cart-service";
import { getStoreSettings } from "@/lib/services/settings-service";
import { calculateTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { proceedToCheckout, removeCartItem, updateCartItem } from "./actions";

export default async function CarritoPage({
  searchParams,
}: PageProps<"/carrito">) {
  const { ajustado } = await searchParams;
  const [cart, settings] = await Promise.all([
    readCart().then(resolveCart),
    getStoreSettings(),
  ]);

  const adjustedBanner = ajustado === "1" && (
    <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Actualizamos tu carrito porque cambió el stock de algunos productos.
      Revisalo antes de continuar.
    </p>
  );

  if (cart.lines.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Tu carrito</h1>
        {adjustedBanner}
        <p className="mt-4 text-black/60">Tu carrito está vacío.</p>
        <Link href="/productos" className="mt-4 inline-block text-sm underline">
          Ver productos
        </Link>
      </div>
    );
  }

  const hasSellableItems = cart.subtotal > 0;
  const withDelivery = hasSellableItems
    ? calculateTotals(cart.subtotal, "DELIVERY", settings)
    : { subtotal: 0, shippingCost: 0, total: 0 };
  const missingForFreeShipping = hasSellableItems
    ? settings.freeShippingFrom - cart.subtotal
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Tu carrito</h1>
      {adjustedBanner}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {cart.lines.map((line) => (
            <li
              key={line.variantId}
              className="rounded-lg border border-black/10 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/productos/${line.productSlug}`}
                    className="font-medium hover:underline"
                  >
                    {line.productName}
                  </Link>
                  <p className="text-sm text-black/60">
                    {line.variantName} · {formatPrice(line.unitPrice)} c/u
                  </p>
                </div>
                <p className="font-medium">{formatPrice(line.lineTotal)}</p>
              </div>

              {line.issue === "reduced" && (
                <p className="mt-2 text-sm text-amber-700">
                  Solo quedan {line.availableStock} unidades. Ajustamos la
                  cantidad.
                </p>
              )}
              {line.issue === "unavailable" && (
                <p className="mt-2 text-sm text-red-600">
                  Ya no está disponible y no se va a incluir en tu pedido.
                </p>
              )}

              <div className="mt-3 flex items-center gap-4">
                {line.issue !== "unavailable" && (
                  <div className="flex items-center gap-2">
                    <form action={updateCartItem}>
                      <input type="hidden" name="variantId" value={line.variantId} />
                      <input type="hidden" name="quantity" value={line.quantity - 1} />
                      <button
                        type="submit"
                        aria-label="Quitar una unidad"
                        className="h-8 w-8 rounded-full border border-black/15"
                      >
                        −
                      </button>
                    </form>
                    <span className="w-6 text-center text-sm font-medium">
                      {line.quantity}
                    </span>
                    <form action={updateCartItem}>
                      <input type="hidden" name="variantId" value={line.variantId} />
                      <input type="hidden" name="quantity" value={line.quantity + 1} />
                      <button
                        type="submit"
                        aria-label="Agregar una unidad"
                        disabled={line.quantity >= line.availableStock}
                        className="h-8 w-8 rounded-full border border-black/15 disabled:opacity-30"
                      >
                        +
                      </button>
                    </form>
                  </div>
                )}
                <form action={removeCartItem}>
                  <input type="hidden" name="variantId" value={line.variantId} />
                  <button type="submit" className="text-sm text-black/60 underline">
                    Quitar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg border border-black/10 p-4">
          <h2 className="font-medium">Resumen</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-black/60">Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/60">Envío a domicilio</dt>
              <dd>
                {!hasSellableItems
                  ? "—"
                  : withDelivery.shippingCost === 0
                    ? "Gratis"
                    : formatPrice(withDelivery.shippingCost)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 font-medium">
              <dt>Total con envío</dt>
              <dd>{formatPrice(withDelivery.total)}</dd>
            </div>
          </dl>

          {missingForFreeShipping > 0 && (
            <p className="mt-3 text-xs text-black/60">
              Envío gratis desde {formatPrice(settings.freeShippingFrom)}. Te
              faltan {formatPrice(missingForFreeShipping)}.
            </p>
          )}
          <p className="mt-2 text-xs text-black/60">
            Si retirás en el local ({settings.pickupAddress}) no pagás envío.
            Lo elegís en el próximo paso.
          </p>

          <form action={proceedToCheckout} className="mt-4">
            <button
              type="submit"
              disabled={!hasSellableItems}
              className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            >
              Continuar al checkout
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
