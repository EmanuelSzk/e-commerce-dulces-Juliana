import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/services/product-service";
import { getStoreSettings } from "@/lib/services/settings-service";
import { formatPrice } from "@/lib/format";
import { AddToCartForm } from "@/components/shop/add-to-cart-form";
import { ProductCard } from "@/components/shop/product-card";
import { badgeClass } from "@/components/ui/styles";

export async function generateMetadata({
  params,
}: PageProps<"/productos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.name,
    description: product.description,
    openGraph: product.imageUrl ? { images: [product.imageUrl] } : undefined,
  };
}

export default async function ProductoDetallePage({
  params,
}: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product),
    getStoreSettings(),
  ]);

  // Prisma's Decimal can't be passed to a client component; send plain numbers.
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    price: Number(variant.price),
    stock: variant.stock,
  }));

  return (
    <div>
      <nav className="text-[12.5px] font-light text-taupe">
        <Link href="/" className="hover:underline">Inicio</Link> ·{" "}
        <Link href={`/productos?categoria=${product.category.slug}`} className="hover:underline">
          {product.category.name}
        </Link>{" "}
        · <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-[1.08fr_1fr] md:gap-10">
        <div className="relative h-80 overflow-hidden rounded-[24px] bg-sand md:h-[440px]">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          )}
        </div>

        <div className="pt-1">
          <span className={badgeClass("blush")}>{product.category.name}</span>
          <h1 className="mt-3.5 font-serif text-5xl leading-[1.04] text-ink md:text-[52px]">
            {product.name}
          </h1>
          <p className="mt-3 max-w-[48ch] whitespace-pre-line text-[15.5px] font-light leading-relaxed text-cocoa">
            {product.description}
          </p>

          <AddToCartForm variants={variants} />

          <dl className="mt-6 grid gap-3 rounded-[20px] bg-surface px-5 py-5 text-[13.5px] font-light text-cocoa">
            <div className="flex gap-3">
              <dt className="min-w-24 font-medium text-ink">Retiro</dt>
              <dd>Sin cargo en {settings.pickupAddress}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="min-w-24 font-medium text-ink">Envío</dt>
              <dd>
                {formatPrice(settings.shippingCost)} en Posadas · gratis desde{" "}
                {formatPrice(settings.freeShippingFrom)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="-mx-4 mt-12 bg-surface px-4 py-8 sm:-mx-8 sm:px-8">
          <h2 className="font-serif text-3xl text-ink">También te puede gustar</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
