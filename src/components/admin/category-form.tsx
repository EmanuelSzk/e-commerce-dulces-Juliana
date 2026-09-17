"use client";

import { useActionState } from "react";
import {
  createCategory,
  type CategoryFormState,
} from "@/app/admin/categorias/actions";

export function CategoryForm() {
  const [state, action, pending] = useActionState<CategoryFormState, FormData>(
    createCategory,
    undefined,
  );

  return (
    <form action={action} className="flex flex-wrap items-start gap-2">
      <div>
        <input
          name="name"
          placeholder="Nueva categoría"
          className="w-56 rounded-lg border border-black/15 px-3 py-2 text-sm"
        />
        {state?.message && (
          <p className="mt-1 text-sm text-red-600">{state.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Agregando…" : "Agregar"}
      </button>
    </form>
  );
}
