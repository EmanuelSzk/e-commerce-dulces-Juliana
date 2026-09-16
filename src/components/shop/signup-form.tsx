"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, loginWithGoogle, type AuthFormState } from "@/app/(shop)/cuenta/actions";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signup,
    undefined,
  );

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

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
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          {state?.errors?.password && (
            <p className="mt-1 text-sm text-red-600">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {state?.message && <p className="text-sm text-black/70">{state.message}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Creando cuenta…" : "Crear cuenta"}
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
        ¿Ya tenés cuenta?{" "}
        <Link href="/cuenta/login" className="underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
