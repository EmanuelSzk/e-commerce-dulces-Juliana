"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";

export async function toggleCancellationResolved(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  const resolved = formData.get("resolved") === "1";
  if (typeof id !== "string") return;

  await prisma.cancellationRequest.update({
    where: { id },
    data: { resolvedAt: resolved ? new Date() : null },
  });

  redirect("/admin/arrepentimientos");
}
