import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";
import { deleteCategory, renameCategory } from "./actions";

const errorMessages: Record<string, string> = {
  "en-uso": "No se puede borrar una categoría que tiene productos. Cambiá esos productos de categoría primero.",
  duplicada: "Ya existe otra categoría con ese nombre.",
  nombre: "El nombre debe tener al menos 2 caracteres.",
};

export default async function AdminCategoriasPage({
  searchParams,
}: PageProps<"/admin/categorias">) {
  await requireAdmin();

  const { error } = await searchParams;
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Categorías</h1>

      {typeof error === "string" && errorMessages[error] && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessages[error]}
        </p>
      )}

      <div className="mt-6">
        <CategoryForm />
      </div>

      <ul className="mt-6 space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-black/10 p-3"
          >
            <form action={renameCategory} className="flex items-center gap-2">
              <input type="hidden" name="id" value={category.id} />
              <input
                name="name"
                defaultValue={category.name}
                className="w-56 rounded-lg border border-black/15 px-3 py-1.5 text-sm"
              />
              <button type="submit" className="text-sm underline">
                Guardar
              </button>
            </form>

            <span className="text-sm text-black/50">
              {category._count.products}{" "}
              {category._count.products === 1 ? "producto" : "productos"}
            </span>

            <div className="flex-1" />

            {category._count.products === 0 && (
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <button type="submit" className="text-sm text-red-600 underline">
                  Borrar
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
