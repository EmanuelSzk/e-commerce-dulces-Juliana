-- Esta app accede a la base solo por Prisma (conexión Postgres directa).
-- La API REST automática de Supabase (PostgREST) no se usa, pero por defecto
-- expone toda tabla del schema public a los roles `anon` y `authenticated`,
-- y la clave publishable viaja al navegador. Sin esto, cualquiera podría leer
-- profiles, orders, etc. desde el browser.

-- 1) RLS activado sin políticas: PostgREST queda sin acceso.
--    Prisma se conecta como owner de las tablas, así que no lo afecta.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipping_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;

-- 2) Además se revocan los permisos, así las tablas que creemos más adelante
--    tampoco quedan expuestas por descuido.
REVOKE ALL ON ALL TABLES IN SCHEMA "public" FROM "anon", "authenticated";
REVOKE ALL ON ALL SEQUENCES IN SCHEMA "public" FROM "anon", "authenticated";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon", "authenticated";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon", "authenticated";
