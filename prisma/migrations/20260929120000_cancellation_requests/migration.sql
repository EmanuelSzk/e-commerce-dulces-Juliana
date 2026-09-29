-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "pickupHours" TEXT;

-- CreateTable
CREATE TABLE "cancellation_requests" (
    "id" TEXT NOT NULL,
    "orderReference" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "cancellation_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Misma protección que el resto de las tablas: la API REST de Supabase no debe
-- poder leer estas solicitudes, que tienen datos personales.
ALTER TABLE "cancellation_requests" ENABLE ROW LEVEL SECURITY;
