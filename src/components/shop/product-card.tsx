import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import {
  getDisplayPrice,
  getTotalStock,
  type ProductWithVariants,
} from "@/lib/services/product-service";
import { badgeClass, buttonClass, cardClass } from "@/components/ui/styles";
import { QuickAddButton } from "./quick-add-button";

export const LOW_STOCK_THRESHOLD = 3;

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const price = getDisplayPrice(product);
  const stock = getTotalStock(product);
  const soldOut = stock === 0;
  const lowStock = !soldOut && stock <= LOW_STOCK_THRESHOLD;
  const singleVariant = product.variants.length === 1 ? product.variants[0] : null;
  const href = `/productos/${product.slug}`;

  return (
    <div className={`${cardClass} flex flex-col p-3.5`}>
      <Link
        href={href}
        className="relative block h-44 overflow-hidden rounded-tile bg-sand"
      >
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition duration-300 hover:scale-105 ${
              soldOut ? "opacity-40" : ""
            }`}
          />
        )}
        {soldOut && (
          <span className={`absolute left-2.5 top-2.5 ${badgeClass("ink")}`}>Sin stock</span>
        )}
        {lowStock && (
          <span className={`absolute left-2.5 top-2.5 ${badgeClass("pink")}`}>
            Quedan {stock}
          </span>
        )}
      </Link>

      <p className="mt-3.5 text-[11px] font-medium uppercase tracking-[0.08em] text-taupe">
        {product.category.name}
      </p>
      <Link
        href={href}
        className={`mt-1 text-[17px] font-medium leading-snug hover:underline ${
          soldOut ? "text-taupe" : "text-ink"
        }`}
      >
        {product.name}
      </Link>

      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
        <span className={`text-xl font-semibold ${soldOut ? "text-taupe" : "text-ink"}`}>
          {price === null
            ? "—"
            : `${product.variants.length > 1 ? "desde " : ""}${formatPrice(price)}`}
        </span>
        <span className="text-[12.5px] font-light text-taupe">
          {soldOut ? "Agotado" : `${stock} disponibles`}
        </span>
      </div>

      <div className="mt-auto">
        {soldOut ? (
          <button type="button" disabled className={buttonClass("outline", "md", "mt-3 w-full")}>
            Agotado
          </button>
        ) : singleVariant ? (
          <QuickAddButton variantId={singleVariant.id} />
        ) : (
          <Link href={href} className={buttonClass("ink", "md", "mt-3 w-full")}>
            Ver opciones
          </Link>
        )}
      </div>
    </div>
  );
}
