/// <reference types="node" />
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import process from "node:process";

function json(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getToken(event: any) {
  const auth = event.headers.authorization || event.headers.Authorization;
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

async function requireAdmin(event: any, admin: any) {
  const token = getToken(event);
  if (!token) return { ok: false as const, status: 401 };

  const { data: userData } = await admin.auth.getUser(token);
  const uid = userData?.user?.id;
  if (!uid) return { ok: false as const, status: 401 };

  const { data } = await admin
    .from("user_access")
    .select("is_admin, active")
    .eq("user_id", uid)
    .limit(1);

  if (!data?.[0]?.is_admin || !data?.[0]?.active) {
    return { ok: false as const, status: 403 };
  }
  return { ok: true as const, uid };
}

function safeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function decodeBase64DataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  // Supports "data:image/webp;base64,...."
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("Invalid data URL");
  const contentType = m[1];
  const b64 = m[2];
  const buf = Buffer.from(b64, "base64");
  return { bytes: new Uint8Array(buf), contentType };
}

export const handler: Handler = async (event) => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const check = await requireAdmin(event, admin);
  if (!check.ok) return json(check.status, { error: "Admin access required." });

  const method = (event.httpMethod || "GET").toUpperCase();
  const BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET || "product-images";

  try {
    // =========
    // GET: list products (+ primary image)
    // =========
    if (method === "GET") {
      const includeInactive = event.queryStringParameters?.includeInactive === "1";

      const q = admin
        .from("products")
        .select(
          `
          *,
          categories ( id, name, slug ),
          product_images ( id, storage_path, alt, is_primary, sort_order )
        `
        )
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!includeInactive) q.eq("active", true);

      const { data, error } = await q;
      if (error) return json(500, { error: error.message });

      // Optionally: reduce payload (keep only primary image)
      const rows = (data || []).map((p: any) => {
        const imgs = (p.product_images || []).sort((a: any, b: any) => {
          if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
        return { ...p, primary_image: imgs[0] ?? null };
      });

      return json(200, { rows });
    }

    // =========
    // POST: create product (+ optional image)
    // body: { title, slug?, ...fields, imageDataUrl?, imageAlt? }
    // =========
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const {
        title,
        slug,
        imageDataUrl,
        imageAlt,
        ...rest
      } = body;

      if (!title) return json(400, { error: "Missing title" });

      const finalSlug = slug ? safeSlug(slug) : safeSlug(title);

      const { data: created, error: createErr } = await admin
        .from("products")
        .insert({ title, slug: finalSlug, ...rest })
        .select()
        .single();

      if (createErr) return json(500, { error: createErr.message });

      // Optional image upload
      if (imageDataUrl) {
        const { bytes, contentType } = decodeBase64DataUrl(imageDataUrl);

        const ext =
          contentType === "image/webp" ? "webp" :
          contentType === "image/png" ? "png" :
          contentType === "image/jpeg" ? "jpg" : "bin";

        const path = `products/${created.id}/${Date.now()}.${ext}`;

        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(path, bytes, {
            contentType,
            upsert: true,
            cacheControl: "31536000",
          });

        if (upErr) return json(500, { error: upErr.message });

        // Mark primary image
        const { error: imgErr } = await admin.from("product_images").insert({
          product_id: created.id,
          storage_path: path,
          alt: imageAlt || title,
          is_primary: true,
          sort_order: 0,
        });

        if (imgErr) return json(500, { error: imgErr.message });
      }

      return json(200, { row: created });
    }

    // =========
    // PATCH: update product (+ optional replace primary image)
    // body: { id, ...patchFields, imageDataUrl?, imageAlt? }
    // =========
    if (method === "PATCH") {
      const body = JSON.parse(event.body || "{}");
      const { id, imageDataUrl, imageAlt, ...patch } = body;

      if (!id) return json(400, { error: "Missing id" });

      // Update product fields
      const { data: updated, error: updErr } = await admin
        .from("products")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (updErr) return json(500, { error: updErr.message });

      if (imageDataUrl) {
        // Upload new image
        const { bytes, contentType } = decodeBase64DataUrl(imageDataUrl);
        const ext =
          contentType === "image/webp" ? "webp" :
          contentType === "image/png" ? "png" :
          contentType === "image/jpeg" ? "jpg" : "bin";

        const path = `products/${id}/${Date.now()}.${ext}`;

        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(path, bytes, {
            contentType,
            upsert: true,
            cacheControl: "31536000",
          });

        if (upErr) return json(500, { error: upErr.message });

        // Unset old primary, insert new primary
        await admin
          .from("product_images")
          .update({ is_primary: false })
          .eq("product_id", id)
          .eq("is_primary", true);

        const { error: imgErr } = await admin.from("product_images").insert({
          product_id: id,
          storage_path: path,
          alt: imageAlt || updated.title,
          is_primary: true,
          sort_order: 0,
        });

        if (imgErr) return json(500, { error: imgErr.message });
      }

      return json(200, { row: updated });
    }

    // =========
    // DELETE: delete product (cascades images table) + remove files from storage
    // body: { id }
    // =========
    if (method === "DELETE") {
      const body = JSON.parse(event.body || "{}");
      const { id } = body;
      if (!id) return json(400, { error: "Missing id" });

      // Fetch image paths to delete from storage
      const { data: imgs, error: imgsErr } = await admin
        .from("product_images")
        .select("storage_path")
        .eq("product_id", id);

      if (imgsErr) return json(500, { error: imgsErr.message });

      // Delete product (cascade deletes product_images)
      const { error: delErr } = await admin.from("products").delete().eq("id", id);
      if (delErr) return json(500, { error: delErr.message });

      const paths = (imgs || []).map((x: any) => x.storage_path).filter(Boolean);
      if (paths.length) {
        const { error: rmErr } = await admin.storage.from(BUCKET).remove(paths);
        if (rmErr) {
          // Not fatal; product is deleted already
          return json(200, { ok: true, warn: rmErr.message });
        }
      }

      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed." });
  } catch (e: any) {
    return json(500, { error: e?.message || "Unknown error" });
  }
};