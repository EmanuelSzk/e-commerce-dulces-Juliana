import "server-only";
import { createAdminClient, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export type ImageUploadResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function uploadProductImage(
  file: File,
  productSlug: string,
): Promise<ImageUploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "La imagen debe ser JPG, PNG o WebP." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "La imagen no puede superar los 5 MB." };
  }

  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${productSlug}-${Date.now()}.${extension}`;
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("No se pudo subir la imagen", error);
    return { ok: false, message: "No pudimos subir la imagen. Probá de nuevo." };
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// Best-effort cleanup of a replaced image: never blocks saving the product.
export async function deleteProductImage(url: string | null) {
  if (!url) return;

  const marker = `/${PRODUCT_IMAGES_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = url.slice(index + marker.length);
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  if (error) console.warn("No se pudo borrar la imagen anterior", error);
}
