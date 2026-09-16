import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/lib/services/product-service";
import { formatPrice } from "@/lib/format";

export default async function ProductoDetallePage({
  params,
}: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

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

        <h2 className="mt-8 text-sm font-medium">Presentaciones</h2>
        <ul className="mt-3 space-y-2">
          {product.variants.map((variant) => (
            <li
              key={variant.id}
              className="flex items-baseline justify-between rounded-lg border border-black/10 px-4 py-3"
            >
              <span className="text-sm">{variant.name}</span>
              <span className="flex items-baseline gap-3">
                <span className="font-medium">
                  {formatPrice(variant.price.toString())}
                </span>
                <span className="text-xs text-black/50">
                  {variant.stock > 0
                    ? `${variant.stock} disponibles`
                    : "Agotado"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
