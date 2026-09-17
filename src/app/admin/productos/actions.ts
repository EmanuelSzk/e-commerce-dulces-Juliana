"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import {
  deleteProductImage,
  uploadProductImage,
} from "@/lib/services/image-service";

export type ProductFormState = { message?: string } | undefined;

const VariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { error: "Cada presentación necesita un nombre." }),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  active: z.boolean(),
});

const ProductSchema = z.object({
  name: z.string().trim().min(2, { error: "El nombre debe tener al menos 2 caracteres." }),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(1, { error: "Escribí una descripción." }),
  categoryId: z.string().min(1, { error: "Elegí una categoría." }),
  active: z.boolean(),
  variants: z
    .array(VariantSchema)
    .min(1, { error: "Agregá al menos una presentación." }),
});

function parseForm(formData: FormData) {
  let variants: unknown = [];
  try {
    variants = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    variants = [];
  }

  return ProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? undefined,
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    active: formData.get("active") === "on",
    variants,
  });
}

function firstError(error: z.ZodError) {
  const flat = z.flattenError(error);
  return (
    flat.formErrors[0] ??
    Object.values(flat.fieldErrors).flat().filter(Boolean)[0] ??
    "Revisá los datos del producto."
  );
}

function duplicateSlugMessage(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
    ? "Ya existe un producto con ese slug. Probá con otro."
    : null;
}

// Devuelve url = null cuando no se eligió ninguna imagen (se conserva la actual).
async function readImage(
  formData: FormData,
  slug: string,
): Promise<{ ok: true; url: string | null } | { ok: false; message: string }> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { ok: true, url: null };
  return uploadProductImage(file, slug);
}

export async function createProduct(
  _state: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const fields = parseForm(formData);
  if (!fields.success) return { message: firstError(fields.error) };

  const { name, description, categoryId, active, variants } = fields.data;
  const slug = slugify(fields.data.slug || name);

  const image = await readImage(formData, slug);
  if (!image.ok) return { message: image.message };
  const imageUrl = image.url;

  try {
    await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        active,
        imageUrl,
        variants: {
          create: variants.map((variant, position) => ({
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
            active: variant.active,
            position,
          })),
        },
      },
    });
  } catch (error) {
    const message = duplicateSlugMessage(error);
    if (message) {
      await deleteProductImage(imageUrl);
      return { message };
    }
    throw error;
  }

  redirect("/admin/productos");
}

export async function updateProduct(
  _state: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const fields = parseForm(formData);
  if (!id) return { message: "No encontramos el producto." };
  if (!fields.success) return { message: firstError(fields.error) };

  const current = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!current) return { message: "No encontramos el producto." };

  const { name, description, categoryId, active, variants } = fields.data;
  const slug = slugify(fields.data.slug || name);

  const image = await readImage(formData, slug);
  if (!image.ok) return { message: image.message };
  const newImageUrl = image.url;

  // Las presentaciones que ya se vendieron no se pueden borrar (el pedido las
  // referencia): se desactivan para que dejen de ofrecerse.
  const keptIds = variants.map((variant) => variant.id).filter(Boolean);
  const removed = current.variants.filter((variant) => !keptIds.includes(variant.id));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          categoryId,
          active,
          ...(newImageUrl ? { imageUrl: newImageUrl } : {}),
        },
      });

      for (const [position, variant] of variants.entries()) {
        const data = {
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          active: variant.active,
          position,
        };
        if (variant.id) {
          await tx.productVariant.update({ where: { id: variant.id }, data });
        } else {
          await tx.productVariant.create({ data: { ...data, productId: id } });
        }
      }

      for (const variant of removed) {
        const sold = await tx.orderItem.count({ where: { variantId: variant.id } });
        if (sold > 0) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { active: false },
          });
        } else {
          await tx.productVariant.delete({ where: { id: variant.id } });
        }
      }
    });
  } catch (error) {
    const message = duplicateSlugMessage(error);
    if (message) {
      if (newImageUrl) await deleteProductImage(newImageUrl);
      return { message };
    }
    throw error;
  }

  if (newImageUrl && current.imageUrl) await deleteProductImage(current.imageUrl);

  redirect("/admin/productos");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  const product = await prisma.product.findUnique({ where: { id } });

  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      redirect("/admin/productos?error=vendido");
    }
    throw error;
  }

  await deleteProductImage(product?.imageUrl ?? null);
  redirect("/admin/productos");
}
