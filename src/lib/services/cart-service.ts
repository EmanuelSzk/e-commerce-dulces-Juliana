import "server-only";
import { cookies } from "next/headers";
import * as z from "zod";
import { prisma } from "@/lib/db";

const CART_COOKIE = "cart";
const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// The cookie holds only ids and quantities — never prices. Anyone can edit
// their own cookies, so its contents are validated and prices always come
// from the database.
const CartSchema = z
  .array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  )
  .max(50);

export type CartItem = z.infer<typeof CartSchema>[number];

export type CartLine = {
  variantId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  imageUrl: string | null;
  unitPrice: number;
  availableStock: number;
  requestedQuantity: number;
  quantity: number;
  lineTotal: number;
  issue: "reduced" | "unavailable" | null;
};

export async function readCart(): Promise<CartItem[]> {
  const raw = (await cookies()).get(CART_COOKIE)?.value;
  if (!raw) return [];

  let parsed;
  try {
    parsed = CartSchema.safeParse(JSON.parse(raw));
  } catch {
    return [];
  }
  if (!parsed.success) return [];

  const merged = new Map<string, number>();
  for (const item of parsed.data) {
    merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.quantity);
  }
  return [...merged].map(([variantId, quantity]) => ({ variantId, quantity }));
}

export async function writeCart(items: CartItem[]) {
  const cookieStore = await cookies();

  if (items.length === 0) {
    cookieStore.delete(CART_COOKIE);
    return;
  }

  cookieStore.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function countCartUnits(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

// RF-07: quantities above current stock are reduced and flagged; variants that
// are out of stock or deactivated are flagged and excluded from the subtotal.
export async function resolveCart(items: CartItem[]) {
  if (items.length === 0) {
    return { lines: [] as CartLine[], subtotal: 0, hasIssues: false };
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((item) => item.variantId) } },
    include: { product: true },
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));

  const lines: CartLine[] = [];
  let missingVariants = false;

  for (const item of items) {
    const variant = variantsById.get(item.variantId);
    if (!variant) {
      missingVariants = true;
      continue;
    }

    const sellable = variant.active && variant.product.active && variant.stock > 0;
    const quantity = sellable ? Math.min(item.quantity, variant.stock) : 0;
    const unitPrice = Number(variant.price);

    lines.push({
      variantId: variant.id,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      variantName: variant.name,
      imageUrl: variant.product.imageUrl,
      unitPrice,
      availableStock: sellable ? variant.stock : 0,
      requestedQuantity: item.quantity,
      quantity,
      lineTotal: unitPrice * quantity,
      issue: !sellable ? "unavailable" : quantity < item.quantity ? "reduced" : null,
    });
  }

  return {
    lines,
    subtotal: lines.reduce((total, line) => total + line.lineTotal, 0),
    hasIssues: missingVariants || lines.some((line) => line.issue !== null),
  };
}

// Cart as it would look after accepting every stock adjustment.
export function normalizeCartLines(lines: CartLine[]): CartItem[] {
  return lines
    .filter((line) => line.quantity > 0)
    .map((line) => ({ variantId: line.variantId, quantity: line.quantity }));
}
