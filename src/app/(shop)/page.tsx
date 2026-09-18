import Link from "next/link";
import Image from "next/image";
import {
  getCategoriesWithProducts,
  getDisplayPrice,
  getProducts,
} from "@/lib/services/product-service";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/shop/product-card";
import { CategoryChips } from "@/components/shop/category-chips";
import { badgeClass, buttonClass } from "@/components/ui/styles";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategoriesWithProducts(),
    getProducts(),
  ]);

  const featured = products.find((product) => product.imageUrl) ?? products[0];
  const featuredPrice = featured ? getDisplayPrice(featured) : null;

  return (
    <div className="space-y-10">
      <section className="grid items-center gap-8 pb-6 md:grid-cols-[1.05fr_1fr]">
        <div>
          <span className={badgeClass("blush")}>Repostería artesanal · Posadas</span>
          <h1 className="mt-5 max-w-[14ch] font-serif text-5xl leading-[1.02] tracking-tight text-ink md:text-[68px]">
            Tortas, alfajores y budines hechos a mano
          </h1>
          <p className="mt-4 max-w-[44ch] text-base font-light leading-relaxed text-cocoa">
            Pedí online y elegí si te lo enviamos a tu casa en Posadas o si lo
            retirás por el local. El stock que ves es real.
          </p>
          <Link href="/productos" className={buttonClass("primary", "lg", "mt-7")}>
            Ver catálogo
          </Link>
        </div>

        {featured && (
          <Link
            href={`/productos/${featured.slug}`}
            className="relative block h-72 overflow-hidden rounded-card bg-sand md:h-[400px]"
          >
            {featured.imageUrl && (
              <Image
                src={featured.imageUrl}
                alt={featured.name}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
            <div className="absolute bottom-4 left-4 max-w-[80%] rounded-[18px] bg-cream/95 px-4 py-3.5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-berry">
                Destacado
              </p>
              <p className="font-serif text-2xl leading-tight text-ink">
                {featured.name}
                {featuredPrice !== null && ` desde ${formatPrice(featuredPrice)}`}
              </p>
            </div>
          </Link>
        )}
      </section>

      <section className="-mx-4 bg-surface px-4 py-8 sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryChips categories={categories} />
          <div className="flex-1" />
          <Link href="/productos" className="text-sm text-berry hover:underline">
            Ver todo el catálogo
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="mt-6 text-cocoa">Todavía no hay productos cargados.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
