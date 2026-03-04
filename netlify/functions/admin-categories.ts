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

  try {
    // GET: list categories
    if (method === "GET") {
      const { data, error } = await admin
        .from("categories")
        .select("id,name,slug,sort_order,created_at,updated_at")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) return json(500, { error: error.message });
      return json(200, { rows: data || [] });
    }

    // POST: create category
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const name = (body.name || "").trim();
      const slug = (body.slug || "").trim();

      if (!name) return json(400, { error: "Missing name" });

      const finalSlug = slug ? safeSlug(slug) : safeSlug(name);

      const { data, error } = await admin
        .from("categories")
        .insert({
          name,
          slug: finalSlug,
          sort_order: Number.isFinite(body.sort_order) ? Number(body.sort_order) : 0,
        })
        .select()
        .single();

      if (error) return json(500, { error: error.message });
      return json(200, { row: data });
    }

    // PATCH: update category
    if (method === "PATCH") {
      const body = JSON.parse(event.body || "{}");
      const id = body.id;
      if (!id) return json(400, { error: "Missing id" });

      const patch: any = {};
      if (typeof body.name === "string") patch.name = body.name.trim();
      if (typeof body.slug === "string") patch.slug = safeSlug(body.slug);
      if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order);

      const { data, error } = await admin
        .from("categories")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error) return json(500, { error: error.message });
      return json(200, { row: data });
    }

    // DELETE: delete category (FK on products is "on delete set null")
    if (method === "DELETE") {
      const body = JSON.parse(event.body || "{}");
      const id = body.id;
      if (!id) return json(400, { error: "Missing id" });

      const { error } = await admin.from("categories").delete().eq("id", id);
      if (error) return json(500, { error: error.message });

      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed." });
  } catch (e: any) {
    return json(500, { error: e?.message || "Unknown error" });
  }
};