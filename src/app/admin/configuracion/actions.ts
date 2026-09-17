"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";

export type SettingsFormState = { message?: string } | undefined;

const SettingsSchema = z.object({
  shippingCost: z.coerce.number().min(0, { error: "El costo de envío no puede ser negativo." }),
  freeShippingFrom: z.coerce
    .number()
    .min(0, { error: "El mínimo para envío gratis no puede ser negativo." }),
  pickupAddress: z
    .string()
    .trim()
    .min(5, { error: "Escribí la dirección del local." }),
});

export async function updateStoreSettings(
  _state: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireAdmin();

  const fields = SettingsSchema.safeParse({
    shippingCost: formData.get("shippingCost"),
    freeShippingFrom: formData.get("freeShippingFrom"),
    pickupAddress: formData.get("pickupAddress"),
  });

  if (!fields.success) {
    const flat = z.flattenError(fields.error);
    return { message: Object.values(flat.fieldErrors).flat()[0] };
  }

  await prisma.storeSettings.update({
    where: { id: "store" },
    data: fields.data,
  });

  redirect("/admin/configuracion?guardado=1");
}
