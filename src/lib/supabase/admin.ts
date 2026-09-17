import "server-only";
import { createClient } from "@supabase/supabase-js";

export const PRODUCT_IMAGES_BUCKET = "productos";

// Service-role client: it bypasses RLS, so it must only ever run on the server.
// For anything tied to the visitor's session use supabase/client.ts or server.ts.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );
}
