import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

export const getStoreSettings = cache(async () => {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "store" },
  });

  if (!settings) {
    throw new Error(
      'Falta la configuración de la tienda (fila "store" en store_settings). Correr el seed.',
    );
  }

  return {
    shippingCost: Number(settings.shippingCost),
    freeShippingFrom: Number(settings.freeShippingFrom),
    pickupAddress: settings.pickupAddress,
  };
});
