"use client";

import { useActionState } from "react";
import {
  submitCancellationRequest,
  type CancellationFormState,
} from "@/app/(shop)/arrepentimiento/actions";
import { buttonClass, inputClass } from "@/components/ui/styles";

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <p className="mt-1.5 text-sm text-berry">{messages[0]}</p> : null;
}

export function CancellationForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState<CancellationFormState, FormData>(
    submitCancellationRequest,
    undefined,
  );

  return (
    <form action={action} className="mt-8 grid max-w-xl gap-4">
      {/* Campo trampa contra spam: oculto para las personas. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div>
        <label htmlFor="fullName" className="text-[12.5px] font-medium text-cocoa">
          Nombre y apellido
        </label>
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={defaultName}
          className={inputClass}
        />
        <FieldError messages={state?.errors?.fullName} />
      </div>

      <div>
        <label htmlFor="email" className="text-[12.5px] font-medium text-cocoa">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          className={inputClass}
        />
        <FieldError messages={state?.errors?.email} />
      </div>

      <div>
        <label htmlFor="phone" className="text-[12.5px] font-medium text-cocoa">
          Teléfono <span className="font-light text-taupe">(opcional)</span>
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        <FieldError messages={state?.errors?.phone} />
      </div>

      <div>
        <label htmlFor="orderReference" className="text-[12.5px] font-medium text-cocoa">
          Número de pedido
        </label>
        <input
          id="orderReference"
          name="orderReference"
          placeholder="#AB12CD34, o la fecha en que compraste"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs font-light text-taupe">
          Lo encontrás en Mi cuenta. Si no lo tenés, contanos cuándo compraste y qué.
        </p>
        <FieldError messages={state?.errors?.orderReference} />
      </div>

      <div>
        <label htmlFor="message" className="text-[12.5px] font-medium text-cocoa">
          Comentario <span className="font-light text-taupe">(opcional)</span>
        </label>
        <textarea id="message" name="message" rows={4} className={inputClass} />
        <FieldError messages={state?.errors?.message} />
      </div>

      {state?.message && <p className="text-sm text-berry">{state.message}</p>}

      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-max")}>
        {pending ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
