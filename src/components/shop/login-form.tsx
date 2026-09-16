"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, loginWithGoogle, type AuthFormState } from "@/app/(shop)/cuenta/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  );

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

      <form action={action} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {state?.message && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <form action={loginWithGoogle} className="mt-3">
        <button
          type="submit"
          className="w-full rounded-full border border-black/15 px-4 py-2.5 text-sm"
        >
          Continuar con Google
        </button>
      </form>

      <p className="mt-6 text-sm text-black/60">
        ¿No tenés cuenta?{" "}
        <Link href="/cuenta/registro" className="underline">
          Creá una
        </Link>
      </p>
    </div>
  );
}
