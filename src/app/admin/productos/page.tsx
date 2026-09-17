import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { deleteProduct } from "./actions";

export default async function AdminProductosPage({
  searchParams,
}: PageProps<"/admin/productos">) {
  await requireAdmin();

  const { error } = await searchParams;
  // A diferencia del catálogo público, acá también se ven los desactivados.
  const products = await prisma.product.findMany({
    include: { category: true, variants: { orderBy: { position: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Nuevo producto
        </Link>
      </div>

      {error === "vendido" && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          No se puede borrar un producto que ya se vendió, porque quedaría un
          pedido sin datos. Desactivalo para que deje de aparecer en la tienda.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {products.map((product) => {
          const stock = product.variants.reduce((total, v) => total + v.stock, 0);
          const prices = product.variants.map((v) => Number(v.price));

          return (
            <li key={product.id} className="rounded-lg border border-black/10 p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="font-medium hover:underline"
                >
                  {product.name}
                </Link>
                <span className="text-sm text-black/50">{product.category.name}</span>
                {!product.active && (
                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                    Oculto
                  </span>
                )}
                {stock === 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    Sin stock
                  </span>
                )}
                <div className="flex-1" />
                <span className="text-sm">
                  {prices.length > 0 ? `desde ${formatPrice(Math.min(...prices))}` : "sin precio"}
                </span>
              </div>

              <p className="mt-1 text-sm text-black/60">
                {product.variants.length}{" "}
                {product.variants.length === 1 ? "presentación" : "presentaciones"} ·{" "}
                {stock} en stock
              </p>

              <div className="mt-3 flex gap-4 text-sm">
                <Link href={`/admin/productos/${product.id}`} className="underline">
                  Editar
                </Link>
                <Link href={`/productos/${product.slug}`} className="underline">
                  Ver en la tienda
                </Link>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={product.id} />
                  <button type="submit" className="text-red-600 underline">
                    Borrar
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
