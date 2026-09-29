"use server";

import { redirect } from "next/navigation";
import * as z from "zod";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { formatOrderNumber } from "@/lib/format";

export type CancellationFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
} | undefined;

const CancellationSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Ingresá tu nombre y apellido." }),
  email: z.email({ error: "Ingresá un email válido." }).trim(),
  phone: z.string().trim().max(30).optional(),
  orderReference: z
    .string()
    .trim()
    .min(2, { error: "Indicá el número de pedido o cuándo lo compraste." }),
  message: z.string().trim().max(1000).optional(),
});

export async function submitCancellationRequest(
  _state: CancellationFormState,
  formData: FormData,
): Promise<CancellationFormState> {
  // Campo trampa: las personas no lo ven, los robots de spam lo completan.
  if (formData.get("website")) redirect("/arrepentimiento?enviado=1");

  const fields = CancellationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? undefined,
    orderReference: formData.get("orderReference"),
    message: formData.get("message") ?? undefined,
  });

  if (!fields.success) {
    return { errors: z.flattenError(fields.error).fieldErrors };
  }

  const profile = await getCurrentUser();

  const request = await prisma.cancellationRequest.create({
    data: { ...fields.data, userId: profile?.id ?? null },
  });

  redirect(`/arrepentimiento?enviado=${formatOrderNumber(request.id).slice(1)}`);
}
