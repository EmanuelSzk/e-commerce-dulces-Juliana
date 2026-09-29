"use client";

import { useActionState } from "react";
import {
  updateStoreSettings,
  type SettingsFormState,
} from "@/app/admin/configuracion/actions";

const input = "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

export function SettingsForm({
  settings,
}: {
  settings: {
    shippingCost: number;
    freeShippingFrom: number;
    pickupAddress: string;
    pickupHours: string | null;
  };
}) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    updateStoreSettings,
    undefined,
  );

  return (
    <form action={action} className="max-w-md space-y-5">
      <div>
        <label htmlFor="shippingCost" className="block text-sm font-medium">
          Costo de envío
        </label>
        <input
          id="shippingCost"
          name="shippingCost"
          type="number"
          min={0}
          step={1}
          defaultValue={settings.shippingCost}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="freeShippingFrom" className="block text-sm font-medium">
          Envío gratis a partir de
        </label>
        <input
          id="freeShippingFrom"
          name="freeShippingFrom"
          type="number"
          min={0}
          step={1}
          defaultValue={settings.freeShippingFrom}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="pickupAddress" className="block text-sm font-medium">
          Dirección para retirar
        </label>
        <input
          id="pickupAddress"
          name="pickupAddress"
          defaultValue={settings.pickupAddress}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="pickupHours" className="block text-sm font-medium">
          Horarios para retirar
        </label>
        <input
          id="pickupHours"
          name="pickupHours"
          defaultValue={settings.pickupHours ?? ""}
          placeholder="Lunes a viernes de 10 a 19, sábados de 10 a 13"
          className={input}
        />
        <p className="mt-1 text-xs text-black/50">
          Se muestra en la tienda junto a la dirección. Si lo dejás vacío, no se muestra.
        </p>
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
