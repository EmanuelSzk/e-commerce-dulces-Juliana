import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUser();

  return (
    <>
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold">
            Mi Tienda
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/productos">Productos</Link>
            <Link href="/carrito">Carrito</Link>
            {profile?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
            <Link href={profile ? "/cuenta" : "/cuenta/login"}>
              {profile ? profile.name : "Ingresar"}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-black/10 py-6 text-center text-sm text-black/60">
        © {new Date().getFullYear()} Mi Tienda
      </footer>
    </>
  );
}
