"use client";

import { useActionState } from "react";
import { addToCart, type AddToCartState } from "@/app/(shop)/carrito/actions";
import { buttonClass } from "@/components/ui/styles";

export function QuickAddButton({ variantId }: { variantId: string }) {
  const [state, action, pending] = useActionState<AddToCartState, FormData>(
    addToCart,
    undefined,
  );

  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value="1" />
      <button type="submit" disabled={pending} className={buttonClass("ink", "md", "w-full")}>
        {pending ? "Agregando…" : state?.ok ? "Agregado ✓" : "Agregar"}
      </button>
      {state && !state.ok && (
        <p className="mt-1.5 text-xs text-berry">{state.message}</p>
      )}
    </form>
  );
}
