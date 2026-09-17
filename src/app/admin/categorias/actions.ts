"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export type CategoryFormState = { message?: string } | undefined;

const NameSchema = z
  .string()
  .trim()
  .min(2, { error: "El nombre debe tener al menos 2 caracteres." });

export async function createCategory(
  _state: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = NameSchema.safeParse(formData.get("name"));
  if (!name.success) {
    return { message: z.flattenError(name.error).formErrors[0] };
  }

  try {
    await prisma.category.create({
      data: { name: name.data, slug: slugify(name.data) },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { message: "Ya existe una categoría con ese nombre." };
    }
    throw error;
  }

  redirect("/admin/categorias");
}

export async function renameCategory(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  const name = NameSchema.safeParse(formData.get("name"));
  if (typeof id !== "string" || !name.success) {
    redirect("/admin/categorias?error=nombre");
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name: name.data, slug: slugify(name.data) },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirect("/admin/categorias?error=duplicada");
    }
    throw error;
  }

  redirect("/admin/categorias");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") return;

  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    // La base la protege porque tiene productos asignados.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      redirect("/admin/categorias?error=en-uso");
    }
    throw error;
  }

  redirect("/admin/categorias");
}
