"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import * as z from "zod";
import { createClient } from "@/lib/supabase/server";
import { syncProfile } from "@/lib/dal";

export type AuthFormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

const LoginSchema = z.object({
  email: z.email({ error: "Ingresá un email válido." }).trim(),
  password: z.string().min(1, { error: "Ingresá tu contraseña." }),
});

const SignupSchema = z.object({
  name: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .trim(),
  email: z.email({ error: "Ingresá un email válido." }).trim(),
  password: z
    .string()
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres." }),
});

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!fields.success) {
    return { errors: z.flattenError(fields.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(fields.data);

  if (error) {
    return { message: "Email o contraseña incorrectos." };
  }

  const next = formData.get("next");
  // Solo rutas internas: evita un open redirect si alguien manipula el campo.
  const target =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/cuenta";

  redirect(target);
}

export async function signup(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!fields.success) {
    return { errors: z.flattenError(fields.error).fieldErrors };
  }

  const { name, email, password } = fields.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    return { message: error.message };
  }

  if (!data.user) {
    return { message: "No pudimos crear la cuenta. Probá de nuevo." };
  }

  await syncProfile(data.user, name);

  // Con confirmación de email activada en Supabase, signUp no deja sesión
  // iniciada: en ese caso avisamos en vez de redirigir a la cuenta.
  if (!data.session) {
    return {
      message: "Te enviamos un email para confirmar tu cuenta.",
    };
  }

  redirect("/cuenta");
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/cuenta/login?error=google");
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
