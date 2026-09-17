import Link from "next/link";
import { requireAdmin } from "@/lib/dal";

const sections = [
  { href: "/admin", label: "Tablero" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/configuracion", label: "Configuración" },
];

// Each page and action re-checks the role: layouts don't re-run on navigation.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-full">
      <header className="border-b border-black/10 bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="text-sm font-semibold">Administración</span>
          <nav className="flex flex-wrap gap-4 text-sm">
            {sections.map((section) => (
              <Link key={section.href} href={section.href} className="text-white/80 hover:text-white">
                {section.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1" />
          <Link href="/" className="text-sm text-white/80 hover:text-white">
            Ver la tienda
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
