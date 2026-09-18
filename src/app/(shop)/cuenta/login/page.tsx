import type { Metadata } from "next";
import { AuthShell } from "@/components/shop/auth-shell";
import { LoginForm } from "@/components/shop/login-form";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/cuenta/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  return (
    <AuthShell
      mode="login"
      next={nextPath}
      title="Hola de nuevo"
      subtitle="Entrá para ver tus pedidos y comprar más rápido."
    >
      <LoginForm next={nextPath} />
    </AuthShell>
  );
}
