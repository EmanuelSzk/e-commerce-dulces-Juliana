import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const withVariants = {
  category: true,
  variants: {
    where: { active: true },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: typeof withVariants;
}>;

export function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// For navigation: a category with nothing on sale would lead to an empty page.
export function getCategoriesWithProducts() {
  return prisma.category.findMany({
    where: { products: { some: { active: true } } },
    orderBy: { name: "asc" },
  });
}

export function getProducts(params?: { categorySlug?: string }) {
  return prisma.product.findMany({
    where: {
      active: true,
      ...(params?.categorySlug
        ? { category: { slug: params.categorySlug } }
        : {}),
    },
    include: withVariants,
    orderBy: { createdAt: "desc" },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: withVariants,
  });
}

// Catalog cards show one price per product: the cheapest presentation on offer.
export function getDisplayPrice(product: ProductWithVariants) {
  const prices = product.variants.map((variant) => Number(variant.price));
  return prices.length > 0 ? Math.min(...prices) : null;
}

export function getTotalStock(product: ProductWithVariants) {
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}
