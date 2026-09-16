import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import {
  getDisplayPrice,
  getTotalStock,
  type ProductWithVariants,
} from "@/lib/services/product-service";

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const price = getDisplayPrice(product);
  const stock = getTotalStock(product);
  const hasMultipleVariants = product.variants.length > 1;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-black/10"
    >
      <div className="aspect-square overflow-hidden bg-black/5">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-black/40">
          {product.category.name}
        </p>
        <p className="mt-1 truncate text-sm font-medium">{product.name}</p>
        <p className="mt-1 text-sm text-black/60">
          {price === null
            ? "Sin presentaciones"
            : `${hasMultipleVariants ? "Desde " : ""}${formatPrice(price)}`}
        </p>
        <p className="mt-1 text-xs text-black/50">
          {stock > 0 ? `${stock} disponibles` : "Agotado"}
        </p>
      </div>
    </Link>
  );
}
