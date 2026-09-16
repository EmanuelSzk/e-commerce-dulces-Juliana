-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "shippingCity",
DROP COLUMN "shippingName",
DROP COLUMN "shippingZone",
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "contactPhone" TEXT NOT NULL,
ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL,
ALTER COLUMN "shippingAddress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "mpInitPoint" TEXT;

-- DropTable
DROP TABLE "shipping_rules";

-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'store',
    "shippingCost" DECIMAL(10,2) NOT NULL,
    "freeShippingFrom" DECIMAL(10,2) NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- Misma protección que el resto de las tablas (ver migración
-- lock_down_postgrest_access): la API REST de Supabase no debe poder leerla.
ALTER TABLE "store_settings" ENABLE ROW LEVEL SECURITY;
