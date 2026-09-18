import type { Metadata } from "next";
import { AuthShell } from "@/components/shop/auth-shell";
import { SignupForm } from "@/components/shop/signup-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegistroPage({
  searchParams,
}: PageProps<"/cuenta/registro">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  return (
    <AuthShell
      mode="registro"
      next={nextPath}
      title="Creá tu cuenta"
      subtitle="La necesitás para hacer pedidos y seguir su estado."
    >
      <SignupForm next={nextPath} />
    </AuthShell>
  );
}
