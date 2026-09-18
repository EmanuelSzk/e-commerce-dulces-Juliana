"use client";

import { useActionState, useState } from "react";
import { createOrder, type CheckoutFormState } from "@/app/(shop)/checkout/actions";
import { calculateTotals, type DeliveryMethod } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { buttonClass, inputClass } from "@/components/ui/styles";
import { LockIcon } from "./icons";

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

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <p className="mt-1.5 text-sm text-berry">{messages[0]}</p> : null;
}

export function CheckoutForm(props: CheckoutFormProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("DELIVERY");
  const [state, action, pending] = useActionState<CheckoutFormState, FormData>(
    createOrder,
    undefined,
  );

  const totals = calculateTotals(props.subtotal, deliveryMethod, props);

  const options = [
    {
      value: "DELIVERY" as const,
      label: "Envío a domicilio",
      detail:
        props.subtotal >= props.freeShippingFrom
          ? "Solo dentro de Posadas · gratis en este pedido"
          : `Solo dentro de Posadas · ${formatPrice(props.shippingCost)}`,
    },
    {
      value: "PICKUP" as const,
      label: "Retiro en el local",
      detail: `Sin cargo · ${props.pickupAddress}`,
    },
  ];

  return (
    <form action={action} className="grid items-start gap-8 lg:grid-cols-[1.65fr_1fr]">
      <div className="space-y-8">
        <fieldset>
          <legend className="font-serif text-2xl text-ink">¿Cómo lo recibís?</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {options.map((option) => {
              const selected = deliveryMethod === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[20px] p-4 transition ${
                    selected ? "bg-blush ring-2 ring-pink" : "bg-surface hover:bg-sand"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={option.value}
                    checked={selected}
                    onChange={() => setDeliveryMethod(option.value)}
                    className="mt-1 accent-[#bf4c79]"
                  />
                  <span>
                    <span className="block text-[15px] font-medium text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-[13px] font-light text-cocoa">
                      {option.detail}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <FieldError messages={state?.errors?.deliveryMethod} />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-serif text-2xl text-ink">Tus datos</legend>

          <div>
            <label htmlFor="contactName" className="text-[12.5px] font-medium text-cocoa">
              Nombre y apellido
            </label>
            <input
              id="contactName"
              name="contactName"
              autoComplete="name"
              defaultValue={props.defaultName}
              className={inputClass}
            />
            <FieldError messages={state?.errors?.contactName} />
          </div>

          <div>
            <label htmlFor="contactPhone" className="text-[12.5px] font-medium text-cocoa">
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
            <p className="mt-1.5 text-xs font-light text-taupe">
              Lo usamos solo para coordinar la entrega o el retiro.
            </p>
            <FieldError messages={state?.errors?.contactPhone} />
          </div>

          {deliveryMethod === "DELIVERY" && (
            <div>
              <label htmlFor="shippingAddress" className="text-[12.5px] font-medium text-cocoa">
                Dirección de entrega
              </label>
              <input
                id="shippingAddress"
                name="shippingAddress"
                autoComplete="street-address"
                placeholder="Calle, número, piso/depto"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs font-light text-taupe">Posadas, Misiones</p>
              <FieldError messages={state?.errors?.shippingAddress} />
            </div>
          )}
        </fieldset>
      </div>

      <aside className="rounded-card bg-surface p-6">
        <h2 className="font-serif text-2xl text-ink">Tu pedido</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {props.lines.map((line) => (
            <li key={line.variantId} className="flex justify-between gap-4">
              <span className="font-light text-cocoa">
                {line.quantity} × {line.title}
              </span>
              <span className="text-ink">{formatPrice(line.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="my-4 h-px bg-ink/10" />
        <dl className="grid gap-3 text-sm font-light text-cocoa">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="font-medium text-ink">{formatPrice(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{deliveryMethod === "PICKUP" ? "Retiro en el local" : "Envío"}</dt>
            <dd className={totals.shippingCost === 0 ? "font-medium text-berry" : "font-medium text-ink"}>
              {totals.shippingCost === 0 ? "Gratis" : formatPrice(totals.shippingCost)}
            </dd>
          </div>
        </dl>
        <div className="my-4 h-px bg-ink/10" />
        <div className="flex items-baseline justify-between">
          <span className="font-medium text-ink">Total</span>
          <span className="text-3xl font-semibold text-ink">{formatPrice(totals.total)}</span>
        </div>

        {state?.message && <p className="mt-4 text-sm text-berry">{state.message}</p>}

        <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "mt-5 w-full")}>
          {pending ? "Preparando el pago…" : "Pagar con Mercado Pago"}
        </button>
        <p className="mt-4 flex items-start gap-2 text-[12.5px] font-light leading-relaxed text-taupe">
          <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Te llevamos a Mercado Pago para completar el pago de forma segura.
        </p>
      </aside>
    </form>
  );
}
