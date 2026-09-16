import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/lib/services/product-service";
import { AddToCartForm } from "@/components/shop/add-to-cart-form";

export default async function ProductoDetallePage({
  params,
}: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  // Prisma's Decimal can't be passed to a client component; send plain numbers.
  const variants = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    price: Number(variant.price),
    stock: variant.stock,
  }));

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-black/5">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={800}
            height={800}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div>
        <p className="text-sm text-black/60">{product.category.name}</p>
        <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
        <p className="mt-6 whitespace-pre-line text-black/80">
          {product.description}
        </p>

        <AddToCartForm variants={variants} />
      </div>
    </div>
  );
}
