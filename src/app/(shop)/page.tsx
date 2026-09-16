import Link from "next/link";
import { getCategories, getProducts } from "@/lib/services/product-service";
import { ProductCard } from "@/components/shop/product-card";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-semibold">Bienvenido a la tienda</h1>
        <p className="mt-2 text-black/60">
          Catálogo en construcción — esta página va a tomar el diseño del
          mockup más adelante.
        </p>
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="text-lg font-medium">Categorías</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/productos?categoria=${c.slug}`}
                className="rounded-full border border-black/10 px-4 py-1.5 text-sm hover:bg-black/5"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Productos</h2>
          <Link href="/productos" className="text-sm underline">
            Ver todos
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-black/60">
              Todavía no hay productos cargados.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
