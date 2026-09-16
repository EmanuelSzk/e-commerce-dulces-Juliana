"use client";

import { useActionState, useState } from "react";
import { createOrder, type CheckoutFormState } from "@/app/(shop)/checkout/actions";
import { calculateTotals, type DeliveryMethod } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";

export type CheckoutLine = {
  variantId: string;
  title: string;
  quantity: number;
  lineTotal: number;
};

type CheckoutFormProps = {
  lines: CheckoutLine[];
  subtotal: number;
  shippingCost: number;
  freeShippingFrom: number;
  pickupAddress: string;
  defaultName: string;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

export function CheckoutForm(props: CheckoutFormProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("DELIVERY");
  const [state, action, pending] = useActionState<CheckoutFormState, FormData>(
    createOrder,
    undefined,
  );

  const totals = calculateTotals(props.subtotal, deliveryMethod, props);

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-8">
        <fieldset>
          <legend className="font-medium">¿Cómo lo recibís?</legend>
          <div className="mt-3 space-y-2">
            {(
              [
                ["DELIVERY", "Envío a domicilio", "Solo dentro de Posadas"],
                ["PICKUP", "Retiro en el local", props.pickupAddress],
              ] as const
            ).map(([value, label, detail]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 ${
                  deliveryMethod === value ? "border-black" : "border-black/10"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={value}
                  checked={deliveryMethod === value}
                  onChange={() => setDeliveryMethod(value)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-black/60">{detail}</span>
                </span>
              </label>
            ))}
          </div>
          {state?.errors?.deliveryMethod && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.deliveryMethod[0]}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-medium">Datos de contacto</legend>

          <div>
            <label htmlFor="contactName" className="block text-sm font-medium">
              Nombre y apellido
            </label>
            <input
              id="contactName"
              name="contactName"
              autoComplete="name"
              defaultValue={props.defaultName}
              className={inputClass}
            />
            {state?.errors?.contactName && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.contactName[0]}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium">
              Teléfono
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              autoComplete="tel"
              placeholder="376 412-3456"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-black/50">
              Lo usamos solo para coordinar la entrega o el retiro.
            </p>
            {state?.errors?.contactPhone && (
              <p className="mt-1 text-sm text-red-600">
                {state.errors.contactPhone[0]}
              </p>
            )}
          </div>

          {deliveryMethod === "DELIVERY" && (
            <div>
              <label
                htmlFor="shippingAddress"
                className="block text-sm font-medium"
              >
                Dirección de entrega
              </label>
              <input
                id="shippingAddress"
                name="shippingAddress"
                autoComplete="street-address"
                placeholder="Calle, número, piso/depto"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-black/50">Posadas, Misiones</p>
              {state?.errors?.shippingAddress && (
                <p className="mt-1 text-sm text-red-600">
                  {state.errors.shippingAddress[0]}
                </p>
              )}
            </div>
          )}
        </fieldset>
      </div>

      <aside className="h-fit rounded-lg border border-black/10 p-4">
        <h2 className="font-medium">Tu pedido</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {props.lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-4">
              <span className="text-black/70">
                {line.quantity} × {line.title}
              </span>
              <span>{formatPrice(line.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-black/60">Subtotal</dt>
            <dd>{formatPrice(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/60">
              {deliveryMethod === "PICKUP" ? "Retiro en el local" : "Envío"}
            </dt>
            <dd>
              {totals.shippingCost === 0 ? "Gratis" : formatPrice(totals.shippingCost)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-2 font-medium">
            <dt>Total</dt>
            <dd>{formatPrice(totals.total)}</dd>
          </div>
        </dl>

        {state?.message && (
          <p className="mt-4 text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Preparando el pago…" : "Pagar con Mercado Pago"}
        </button>
        <p className="mt-3 text-xs text-black/50">
          Te vamos a llevar a Mercado Pago para completar el pago.
        </p>
      </aside>
    </form>
  );
}
