import type { Metadata } from "next";
import {
  getCategoriesWithProducts,
  getProducts,
} from "@/lib/services/product-service";
import { getStoreSettings } from "@/lib/services/settings-service";
import { ProductCard } from "@/components/shop/product-card";
import { PickupMap } from "@/components/shop/pickup-map";
import { CategoryChips } from "@/components/shop/category-chips";
import { productGridClass } from "@/components/ui/styles";

export const metadata: Metadata = { title: "Catálogo" };

export default async function ProductosPage({
  searchParams,
}: PageProps<"/productos">) {
  const { categoria } = await searchParams;
  const categorySlug = typeof categoria === "string" ? categoria : undefined;

  const [categories, products, settings] = await Promise.all([
    getCategoriesWithProducts(),
    getProducts({ categorySlug }),
    getStoreSettings(),
  ]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div>
      <h1 className="font-serif text-4xl text-ink md:text-5xl">
        {activeCategory?.name ?? "Catálogo"}
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <CategoryChips categories={categories} activeSlug={categorySlug} />
        <div className="flex-1" />
        <span className="text-[13px] font-light text-taupe">
          {products.length} {products.length === 1 ? "producto" : "productos"}
        </span>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-cocoa">No hay productos en esta categoría todavía.</p>
      ) : (
        <div className={`mt-6 ${productGridClass}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-12">
        <PickupMap settings={settings} />
      </div>
    </div>
  );
}
