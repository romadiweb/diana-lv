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
): Promise<
  | { ok: true }
  | { ok: false; status: number }
> {
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

  if (!data?.[0]?.is_admin || !data?.[0]?.active)
    return { ok: false, status: 403 };

  return { ok: true };
}

export const handler: Handler = async (event) => {
  const admin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const adminCheck = await requireAdmin(event, admin);
  if (!adminCheck.ok)
    return json(adminCheck.status, { error: "Admin access required." });

  const method = event.httpMethod;

  try {
    // -------- GET
    if (method === "GET") {
      const { data, error } = await admin
        .from("home_course_cards")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) return json(500, { error: error.message });
      return json(200, { rows: data });
    }

    // -------- POST (create)
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");

      const { data, error } = await admin
        .from("home_course_cards")
        .insert(body)
        .select()
        .single();

      if (error) return json(500, { error: error.message });
      return json(200, { row: data });
    }

    // -------- PATCH (update)
    if (method === "PATCH") {
      const body = JSON.parse(event.body || "{}");

      const { id, ...patch } = body;

      const { data, error } = await admin
        .from("home_course_cards")
        .update(patch)
        .eq("id", id)
        .select()
        .single();

      if (error) return json(500, { error: error.message });
      return json(200, { row: data });
    }

    // -------- DELETE
    if (method === "DELETE") {
      const body = JSON.parse(event.body || "{}");

      const { error } = await admin
        .from("home_course_cards")
        .delete()
        .eq("id", body.id);

      if (error) return json(500, { error: error.message });
      return json(200, { ok: true });
    }

    return json(405, { error: "Method not allowed." });
  } catch (e: any) {
    return json(500, { error: e.message });
  }
};