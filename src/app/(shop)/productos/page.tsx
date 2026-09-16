import Link from "next/link";
import { getCategories, getProducts } from "@/lib/services/product-service";
import { ProductCard } from "@/components/shop/product-card";

export default async function ProductosPage({
  searchParams,
}: PageProps<"/productos">) {
  const { categoria } = await searchParams;
  const categorySlug = typeof categoria === "string" ? categoria : undefined;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Productos</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/productos"
          className={`rounded-full border px-4 py-1.5 text-sm ${
            !categorySlug
              ? "border-black bg-black text-white"
              : "border-black/10 hover:bg-black/5"
          }`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/productos?categoria=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              categorySlug === c.slug
                ? "border-black bg-black text-white"
                : "border-black/10 hover:bg-black/5"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="col-span-full text-black/60">
            No hay productos en esta categoría todavía.
          </p>
        )}
      </div>
    </div>
  );
}
