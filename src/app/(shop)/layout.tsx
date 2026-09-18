import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { formatPrice } from "@/lib/format";
import { readCart, resolveCart } from "@/lib/services/cart-service";
import { getCategoriesWithProducts } from "@/lib/services/product-service";
import { getStoreSettings } from "@/lib/services/settings-service";
import { Logo } from "@/components/shop/logo";
import { MobileNav } from "@/components/shop/mobile-nav";
import { SiteFooter } from "@/components/shop/site-footer";
import { CartIcon } from "@/components/shop/icons";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, cart, categories, settings] = await Promise.all([
    getCurrentUser(),
    readCart().then(resolveCart),
    getCategoriesWithProducts(),
    getStoreSettings(),
  ]);

  const cartUnits = cart.lines.reduce((total, line) => total + line.quantity, 0);
  const accountHref = profile ? "/cuenta" : "/cuenta/login";

  return (
    <>
      <div className="bg-peach px-4 py-2.5 text-center text-[12.5px] text-peach-ink">
        Envío gratis en Posadas desde {formatPrice(settings.freeShippingFrom)} · retiro
        sin cargo en el local
      </div>

      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-8">
          <Link href="/" aria-label="Dulces Juliana, inicio">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 text-sm text-cocoa md:flex">
            <Link href="/productos" className="rounded-full px-3.5 py-2 hover:bg-sand">
              Catálogo
            </Link>
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/productos?categoria=${category.slug}`}
                className="rounded-full px-3.5 py-2 hover:bg-sand"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-4 text-sm text-cocoa">
            {profile?.role === "ADMIN" && (
              <Link href="/admin" className="hidden hover:text-ink md:inline">
                Admin
              </Link>
            )}
            <Link href={accountHref} className="hidden hover:text-ink md:inline">
              {profile ? profile.name : "Ingresar"}
            </Link>
            <Link
              href="/carrito"
              className="flex items-center gap-2 rounded-full bg-pink-deep px-4 py-2.5 text-[13.5px] font-medium text-white shadow-pink"
            >
              <CartIcon />
              {cartUnits > 0 ? (
                <>
                  {cartUnits} · {formatPrice(cart.subtotal)}
                </>
              ) : (
                "Carrito"
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-4 sm:px-8 md:pb-12">
        {children}
      </main>

      <SiteFooter categories={categories} settings={settings} />
      <MobileNav cartUnits={cartUnits} accountHref={accountHref} />
    </>
  );
}
