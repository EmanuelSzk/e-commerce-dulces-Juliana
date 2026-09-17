"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from "@/app/admin/productos/actions";
import { slugify } from "@/lib/slug";

type VariantRow = {
  id?: string;
  name: string;
  price: string;
  stock: string;
  active: boolean;
};

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  active: boolean;
  imageUrl: string | null;
  variants: VariantRow[];
};

const emptyVariant: VariantRow = { name: "", price: "0", stock: "0", active: true };

const input = "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm";

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: ProductFormValues;
}) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(
    product?.id ? updateProduct : createProduct,
    undefined,
  );

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product?.slug));
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.length ? product.variants : [emptyVariant],
  );

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  const variantsPayload = JSON.stringify(
    variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: Number(variant.price),
      stock: Number(variant.stock),
      active: variant.active,
    })),
  );

  return (
    <form action={action} className="max-w-2xl space-y-6">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={variantsPayload} />

      <div>
        <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!slugEdited) setSlug(slugify(event.target.value));
          }}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          Dirección web (slug)
        </label>
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugEdited(true);
          }}
          className={input}
        />
        <p className="mt-1 text-xs text-black/50">
          El producto se va a ver en /productos/{slug || "…"}
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">Descripción</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className={input}
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium">Categoría</label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={product?.categoryId ?? ""}
          className={input}
        >
          <option value="">Elegí una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium">Foto</label>
        {product?.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={120}
            height={120}
            className="mt-2 h-28 w-28 rounded-lg object-cover"
          />
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 block text-sm"
        />
        <p className="mt-1 text-xs text-black/50">
          JPG, PNG o WebP, hasta 5 MB. {product?.imageUrl && "Si no elegís una, se mantiene la actual."}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
        Visible en la tienda
      </label>

      <fieldset>
        <legend className="text-sm font-medium">Presentaciones</legend>
        <p className="text-xs text-black/50">
          Cada una con su precio y su stock. Por ejemplo: &ldquo;8 porciones&rdquo;, &ldquo;× 12&rdquo;.
        </p>

        <div className="mt-3 space-y-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `nueva-${index}`}
              className="grid gap-2 rounded-lg border border-black/10 p-3 sm:grid-cols-[1fr_110px_90px_auto]"
            >
              <input
                value={variant.name}
                onChange={(e) => updateVariant(index, { name: e.target.value })}
                placeholder="Nombre"
                className="rounded-lg border border-black/15 px-3 py-2 text-sm"
              />
              <input
                value={variant.price}
                onChange={(e) => updateVariant(index, { price: e.target.value })}
                type="number"
                min={0}
                step={1}
                placeholder="Precio"
                className="rounded-lg border border-black/15 px-3 py-2 text-sm"
              />
              <input
                value={variant.stock}
                onChange={(e) => updateVariant(index, { stock: e.target.value })}
                type="number"
                min={0}
                step={1}
                placeholder="Stock"
                className="rounded-lg border border-black/15 px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={variant.active}
                    onChange={(e) => updateVariant(index, { active: e.target.checked })}
                  />
                  Activa
                </label>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVariants((rows) => rows.filter((_, i) => i !== index))}
                    className="text-xs text-red-600 underline"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setVariants((rows) => [...rows, { ...emptyVariant }])}
          className="mt-3 rounded-full border border-black/15 px-4 py-1.5 text-sm"
        >
          Agregar presentación
        </button>
      </fieldset>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/admin/productos" className="text-sm underline">Cancelar</Link>
      </div>
    </form>
  );
}
