import { supabase } from "./supabase";

const BUCKET = import.meta.env.VITE_SUPABASE_PRODUCTS_BUCKET || "product-images";

export function getProductImageUrl(
  storagePath: string,
  opts?: { width?: number; height?: number; quality?: number }
) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath, {
    transform: {
      width: opts?.width,
      height: opts?.height,
      quality: opts?.quality,
    },
  });

  return data.publicUrl;
}