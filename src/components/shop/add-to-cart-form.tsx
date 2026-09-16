"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { addToCart, type AddToCartState } from "@/app/(shop)/carrito/actions";
import { formatPrice } from "@/lib/format";

export type VariantOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export function AddToCartForm({ variants }: { variants: VariantOption[] }) {
  const firstAvailable = variants.find((variant) => variant.stock > 0);
  const [selectedId, setSelectedId] = useState(firstAvailable?.id ?? "");
  const [state, action, pending] = useActionState<AddToCartState, FormData>(
    addToCart,
    undefined,
  );

  const selected = variants.find((variant) => variant.id === selectedId);

  return (
    <form action={action} className="mt-8">
      <fieldset>
        <legend className="text-sm font-medium">Presentación</legend>
        <div className="mt-3 space-y-2">
          {variants.map((variant) => {
            const soldOut = variant.stock <= 0;
            return (
              <label
                key={variant.id}
                className={`flex items-baseline justify-between rounded-lg border px-4 py-3 ${
                  soldOut
                    ? "cursor-not-allowed border-black/5 text-black/40"
                    : selectedId === variant.id
                      ? "cursor-pointer border-black"
                      : "cursor-pointer border-black/10"
                }`}
              >
                <span className="flex items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name="variantId"
                    value={variant.id}
                    checked={selectedId === variant.id}
                    disabled={soldOut}
                    onChange={() => setSelectedId(variant.id)}
                  />
                  {variant.name}
                </span>
                <span className="flex items-baseline gap-3">
                  <span className="font-medium">{formatPrice(variant.price)}</span>
                  <span className="text-xs text-black/50">
                    {soldOut ? "Agotado" : `${variant.stock} disponibles`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {selected ? (
        <div className="mt-6 flex items-end gap-3">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium">
              Cantidad
            </label>
            <input
              // Remount when the presentation changes so the max stock resets.
              key={selected.id}
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={selected.stock}
              defaultValue={1}
              className="mt-1 w-20 rounded-lg border border-black/15 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Agregando…" : "Agregar al carrito"}
          </button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-black/60">
          Este producto está agotado por el momento.
        </p>
      )}

      {state?.message && (
        <p
          className={`mt-3 text-sm ${state.ok ? "text-black/70" : "text-red-600"}`}
        >
          {state.message}{" "}
          {state.ok && (
            <Link href="/carrito" className="underline">
              Ver carrito
            </Link>
          )}
        </p>
      )}
    </form>
  );
}
