"use client";

import { useActionState } from "react";
import { login, loginWithGoogle, type AuthFormState } from "@/app/(shop)/cuenta/actions";
import { buttonClass, inputClass } from "@/components/ui/styles";
import { PasswordInput } from "./password-input";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  );

  return (
    <div>
      <form action={action} className="grid gap-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <div>
          <label htmlFor="email" className="text-[12.5px] font-medium text-cocoa">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" className={inputClass} />
          {state?.errors?.email && (
            <p className="mt-1.5 text-sm text-berry">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-[12.5px] font-medium text-cocoa">Contraseña</label>
          <PasswordInput id="password" name="password" autoComplete="current-password" />
          {state?.errors?.password && (
            <p className="mt-1.5 text-sm text-berry">{state.errors.password[0]}</p>
          )}
        </div>

        {state?.message && <p className="text-sm text-berry">{state.message}</p>}

        <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs font-light text-taupe">
        <span className="h-px flex-1 bg-ink/10" />o<span className="h-px flex-1 bg-ink/10" />
      </div>

      <form action={loginWithGoogle}>
        <button type="submit" className={buttonClass("outline", "lg", "w-full")}>
          Continuar con Google
        </button>
      </form>
    </div>
  );
}
