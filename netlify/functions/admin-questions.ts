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

async function requireAdmin(
  event: any,
  admin: any
): Promise<{ ok: true } | { ok: false; status: number }> {
  const token = getToken(event);
  if (!token) return { ok: false, status: 401 };

  const { data: userData } = await admin.auth.getUser(token);
  const uid = userData?.user?.id;
  if (!uid) return { ok: false, status: 401 };

  const { data } = await admin
    .from("user_access")
    .select("is_admin, active")
    .eq("user_id", uid)
    .limit(1);

  if (!data?.[0]?.is_admin || !data?.[0]?.active) return { ok: false, status: 403 };
  return { ok: true };
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
    const TABLE = "questions";

    // ---------- GET (with pagination)
    if (method === "GET") {
      const page = Math.max(1, Number(event.queryStringParameters?.page || 1));
      const pageSizeRaw = Number(event.queryStringParameters?.pageSize || 20);
      const pageSize = Math.min(100, Math.max(5, pageSizeRaw));

      const search = String(event.queryStringParameters?.search || "").trim();
      const topic_id = String(event.queryStringParameters?.topic_id || "").trim();

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let q = admin
        .from(TABLE)
        .select("*", { count: "exact" })
        .order("sort_order", { ascending: true })
        .range(from, to);

      if (topic_id) q = q.eq("topic_id", topic_id);
      if (search) q = q.ilike("text", `%${search.replace(/%/g, "")}%`);

      const { data, error, count } = await q;
      if (error) return json(500, { error: error.message });

      return json(200, {
        rows: data ?? [],
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      });
    }

    // ---------- POST (create)
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");

      const { data, error } = await admin
        .from(TABLE)
        .insert(body)
        .select()
        .single();

      if (error) return json(500, { error: error.message });
      return json(200, { row: data });
    }

    // ---------- PATCH (update)
    if (method === "PATCH") {
      const body = JSON.parse(event.body || "{}");
      const { id, ...patch } = body;
      if (!id) return json(400, { error: "Missing id" });

      const { data, error } = await admin
        .from(TABLE)
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error) return json(500, { error: error.message });
      return json(200, { row: data });
    }

    // ---------- DELETE
    if (method === "DELETE") {
      const body = JSON.parse(event.body || "{}");
      const { id } = body;
      if (!id) return json(400, { error: "Missing id" });

      const { error } = await admin.from(TABLE).delete().eq("id", id);
      if (error) return json(500, { error: error.message });
      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed." });
  } catch (e: any) {
    return json(500, { error: e?.message || "Unknown error" });
  }
};