import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export default async function NuevoProductoPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Nuevo producto</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
