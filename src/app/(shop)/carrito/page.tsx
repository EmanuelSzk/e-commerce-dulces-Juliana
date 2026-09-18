import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { readCart, resolveCart } from "@/lib/services/cart-service";
import { getStoreSettings } from "@/lib/services/settings-service";
import { calculateTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { CheckoutSteps } from "@/components/shop/checkout-steps";
import { AlertIcon, CheckIcon, LockIcon } from "@/components/shop/icons";
import { buttonClass } from "@/components/ui/styles";
import { proceedToCheckout, removeCartItem, updateCartItem } from "./actions";

export const metadata: Metadata = { title: "Tu carrito" };

export default async function CarritoPage({
  searchParams,
}: PageProps<"/carrito">) {
  const { ajustado } = await searchParams;
  const [cart, settings] = await Promise.all([
    readCart().then(resolveCart),
    getStoreSettings(),
  ]);

  const adjustedBanner = ajustado === "1" && (
    <p className="mt-4 flex items-center gap-2 rounded-tile bg-blush px-4 py-3 text-sm text-berry">
      <AlertIcon />
      Actualizamos tu carrito porque cambió el stock de algunos productos. Revisalo antes
      de continuar.
    </p>
  );

  if (cart.lines.length === 0) {
    return (
      <div className="py-6">
        <CheckoutSteps current={1} />
        <h1 className="mt-5 font-serif text-4xl text-ink">Tu carrito</h1>
        {adjustedBanner}
        <p className="mt-4 text-cocoa">Tu carrito está vacío.</p>
        <Link href="/productos" className={buttonClass("primary", "md", "mt-5")}>
          Ver el catálogo
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
  const units = cart.lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <div className="py-2">
      <CheckoutSteps current={1} />

      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[1.65fr_1fr]">
        <div>
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-4xl text-ink">Tu carrito</h1>
            <span className="text-[13px] font-light text-taupe">
              {units} {units === 1 ? "producto" : "productos"}
            </span>
          </div>
          {adjustedBanner}

          <ul className="mt-5 space-y-3">
            {cart.lines.map((line) => {
              const unavailable = line.issue === "unavailable";
              return (
                <li
                  key={line.variantId}
                  className={`grid grid-cols-[76px_1fr] gap-4 rounded-[20px] p-4 sm:grid-cols-[102px_1fr_auto] ${
                    line.issue ? "bg-blush" : "bg-surface"
                  }`}
                >
                  <div className="relative h-[76px] overflow-hidden rounded-tile bg-sand sm:h-[102px]">
                    {line.imageUrl && (
                      <Image
                        src={line.imageUrl}
                        alt={line.productName}
                        fill
                        sizes="102px"
                        className={`object-cover ${unavailable ? "opacity-40" : ""}`}
                      />
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/productos/${line.productSlug}`}
                      className="text-[17px] font-medium text-ink hover:underline"
                    >
                      {line.productName}
                    </Link>
                    <p className="mt-0.5 text-[13px] font-light text-taupe">
                      {line.variantName} · {formatPrice(line.unitPrice)} c/u
                    </p>

                    {line.issue === "reduced" && (
                      <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-berry">
                        <AlertIcon />
                        Solo quedan {line.availableStock} unidades. Ajustamos la cantidad.
                      </p>
                    )}
                    {unavailable && (
                      <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-berry">
                        <AlertIcon />
                        Ya no está disponible y no se va a incluir en tu pedido.
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-4">
                      {!unavailable && (
                        <div className="flex items-center rounded-full bg-cream p-0.5">
                          <form action={updateCartItem}>
                            <input type="hidden" name="variantId" value={line.variantId} />
                            <input type="hidden" name="quantity" value={line.quantity - 1} />
                            <button
                              type="submit"
                              aria-label="Restar una unidad"
                              className="grid h-8 w-8 place-items-center rounded-full text-cocoa hover:bg-sand"
                            >
                              –
                            </button>
                          </form>
                          <span className="w-8 text-center text-sm font-semibold text-ink">
                            {line.quantity}
                          </span>
                          <form action={updateCartItem}>
                            <input type="hidden" name="variantId" value={line.variantId} />
                            <input type="hidden" name="quantity" value={line.quantity + 1} />
                            <button
                              type="submit"
                              aria-label="Sumar una unidad"
                              disabled={line.quantity >= line.availableStock}
                              className="grid h-8 w-8 place-items-center rounded-full text-cocoa hover:bg-sand disabled:opacity-30"
                            >
                              +
                            </button>
                          </form>
                        </div>
                      )}
                      <form action={removeCartItem}>
                        <input type="hidden" name="variantId" value={line.variantId} />
                        <button type="submit" className="text-[13px] font-light text-taupe hover:underline">
                          Quitar
                        </button>
                      </form>
                    </div>
                  </div>

                  <p className="col-start-2 text-lg font-semibold text-ink sm:col-start-auto sm:pr-1.5 sm:text-right">
                    {formatPrice(line.lineTotal)}
                  </p>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 flex items-center gap-2 text-[13px] font-light text-taupe">
            <CheckIcon />
            Tu carrito se guarda aunque cierres el navegador.
          </p>
        </div>

        <aside className="rounded-card bg-surface p-6">
          <h2 className="font-serif text-2xl text-ink">Resumen</h2>
          <dl className="mt-4 grid gap-3 text-sm font-light text-cocoa">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-medium text-ink">{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Envío a domicilio</dt>
              <dd className={withDelivery.shippingCost === 0 ? "font-medium text-berry" : "font-medium text-ink"}>
                {!hasSellableItems
                  ? "—"
                  : withDelivery.shippingCost === 0
                    ? "Gratis"
                    : formatPrice(withDelivery.shippingCost)}
              </dd>
            </div>
          </dl>
          <div className="my-4 h-px bg-ink/10" />
          <div className="flex items-baseline justify-between">
            <span className="font-medium text-ink">Total con envío</span>
            <span className="text-3xl font-semibold text-ink">{formatPrice(withDelivery.total)}</span>
          </div>

          {missingForFreeShipping > 0 && (
            <p className="mt-3 text-[13px] text-berry">
              Te faltan {formatPrice(missingForFreeShipping)} para el envío gratis.
            </p>
          )}
          <p className="mt-2 text-[13px] font-light text-cocoa">
            Si retirás en el local no pagás envío. Lo elegís en el próximo paso.
          </p>

          <form action={proceedToCheckout} className="mt-5">
            <button
              type="submit"
              disabled={!hasSellableItems}
              className={buttonClass("primary", "lg", "w-full")}
            >
              Continuar
            </button>
          </form>

          <p className="mt-4 flex items-start gap-2 text-[12.5px] font-light leading-relaxed text-taupe">
            <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Pago procesado por Mercado Pago. El stock se descuenta recién cuando el pago
            se confirma.
          </p>
          <div className="my-4 h-px bg-ink/10" />
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-taupe">
            Medios de pago
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Mercado Pago", "Débito", "Crédito"].map((method) => (
              <span key={method} className="rounded-full bg-cream px-3 py-1.5 text-[11.5px] text-cocoa">
                {method}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
