import { LoginForm } from "@/components/shop/login-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/cuenta/login">) {
  const { next } = await searchParams;

  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}
