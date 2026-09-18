"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { addToCart, type AddToCartState } from "@/app/(shop)/carrito/actions";
import { formatPrice } from "@/lib/format";
import { buttonClass } from "@/components/ui/styles";
import { ClockIcon } from "./icons";

export type VariantOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

const LOW_STOCK_THRESHOLD = 3;

export function AddToCartForm({ variants }: { variants: VariantOption[] }) {
  const firstAvailable = variants.find((variant) => variant.stock > 0);
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [state, action, pending] = useActionState<AddToCartState, FormData>(
    addToCart,
    undefined,
  );

  const selected = variants.find((variant) => variant.id === selectedId);

  if (!selected) {
    return (
      <p className="mt-8 rounded-tile bg-sand px-4 py-3 text-sm text-cocoa">
        Este producto está agotado por el momento.
      </p>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="variantId" value={selected.id} />
      <input type="hidden" name="quantity" value={quantity} />

      <p className="mt-6 text-4xl font-semibold text-ink">{formatPrice(selected.price)}</p>

      {selected.stock <= LOW_STOCK_THRESHOLD && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-tile bg-blush px-4 py-2.5 text-[13.5px] font-medium text-berry">
          <ClockIcon />
          {selected.stock === 1 ? "Queda 1 unidad" : `Quedan ${selected.stock} unidades`}
        </p>
      )}

      {variants.length > 1 && (
        <>
          <p className="mb-2.5 mt-6 text-[13px] font-medium text-ink">Presentación</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const soldOut = variant.stock <= 0;
              const isSelected = variant.id === selected.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    setSelectedId(variant.id);
                    setQuantity(1);
                  }}
                  className={`rounded-full px-5 py-2.5 text-[13.5px] transition ${
                    isSelected
                      ? "bg-ink font-medium text-cream"
                      : soldOut
                        ? "border border-ink/10 text-taupe"
                        : "border border-ink/20 text-ink hover:bg-ink/5"
                  }`}
                >
                  {variant.name}
                  {!isSelected && (soldOut ? " · agotado" : ` · ${formatPrice(variant.price)}`)}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full bg-sand p-1">
          <button
            type="button"
            aria-label="Restar una unidad"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid h-10 w-10 place-items-center rounded-full bg-cream text-lg text-cocoa disabled:opacity-40"
          >
            –
          </button>
          <span className="w-10 text-center text-base font-semibold text-ink">{quantity}</span>
          <button
            type="button"
            aria-label="Sumar una unidad"
            disabled={quantity >= selected.stock}
            onClick={() => setQuantity((q) => Math.min(selected.stock, q + 1))}
            className="grid h-10 w-10 place-items-center rounded-full bg-cream text-lg text-cocoa disabled:opacity-40"
          >
            +
          </button>
        </div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary", "lg", "min-w-60 flex-1")}
        >
          {pending
            ? "Agregando…"
            : `Agregar al carrito · ${formatPrice(selected.price * quantity)}`}
        </button>
      </div>

      {state?.message && (
        <p className={`mt-3 text-sm ${state.ok ? "text-cocoa" : "text-berry"}`}>
          {state.message}{" "}
          {state.ok && (
            <Link href="/carrito" className="font-medium text-berry underline">
              Ver carrito
            </Link>
          )}
        </p>
      )}
    </form>
  );
}
