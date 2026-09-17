import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditarProductoPage({
  params,
}: PageProps<"/admin/productos/[id]">) {
  await requireAdmin();

  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <div className="mt-6">
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            categoryId: product.categoryId,
            active: product.active,
            imageUrl: product.imageUrl,
            variants: product.variants.map((variant) => ({
              id: variant.id,
              name: variant.name,
              price: String(variant.price),
              stock: String(variant.stock),
              active: variant.active,
            })),
          }}
        />
      </div>
    </div>
  );
}
