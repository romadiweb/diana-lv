/// <reference types="node" />
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import process from "node:process";

type UA = {
  user_id: string;
  active: boolean;
  never_expires: boolean;
  expires_at: string | null;
  note: string | null;
  is_admin: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type UAWithEmail = UA & { email?: string | null };

function json(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getBearerToken(event: Parameters<Handler>[0]) {
  const auth = event.headers.authorization || (event.headers as any).Authorization;
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

async function requireAdmin(event: Parameters<Handler>[0], admin: any) {
  const token = getBearerToken(event);
  if (!token) return { ok: false as const, status: 401, message: "Trūkst Authorization Bearer token." };

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return { ok: false as const, status: 401, message: "Nederīga sesija. Ielogojies vēlreiz." };
  }

  const uid = userData.user.id;

  const { data: accessRows, error: accessErr } = await admin
    .from("user_access")
    .select("active, is_admin")
    .eq("user_id", uid)
    .limit(1);

  if (accessErr) return { ok: false as const, status: 500, message: "Neizdevās pārbaudīt admin piekļuvi." };

  const row = accessRows?.[0] as { active?: boolean; is_admin?: boolean } | undefined;
  if (!row?.active || !row?.is_admin) {
    return { ok: false as const, status: 403, message: "Nepietiekamas tiesības (nepieciešams administrators)." };
  }

  return { ok: true as const, uid };
}

// Try to read auth.users emails via PostgREST schema.
// If that fails in your project for any reason, fallback to listUsers paging.
async function attachEmails(admin: any, rows: UA[]): Promise<UAWithEmail[]> {
  const ids = (rows ?? []).map((r) => r.user_id).filter(Boolean);
  if (ids.length === 0) return rows as UAWithEmail[];

  try {
    const { data: users, error } = await admin
      .schema("auth")
      .from("users")
      .select("id,email")
      .in("id", ids);

    if (error) throw error;

    const emailById = new Map<string, string | null>((users ?? []).map((u: any) => [u.id, u.email ?? null]));
    return (rows ?? []).map((r) => ({ ...r, email: emailById.get(r.user_id) ?? null }));
  } catch {
    // Fallback: admin.auth.admin.listUsers (paged)
    const found = new Map<string, string | null>();
    let page = 1;
    const perPage = 1000;

    while (found.size < ids.length) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) break;

      for (const u of data.users ?? []) {
        if (ids.includes(u.id)) found.set(u.id, (u.email ?? null) as any);
      }

      if (!data.users || data.users.length < perPage) break;
      page += 1;
      if (page > 10) break; // safety cap
    }

    return (rows ?? []).map((r) => ({ ...r, email: found.get(r.user_id) ?? null }));
  }
}

async function findAuthUserIdByEmail(admin: any, emailRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email) return null;

  // Try schema auth.users
  try {
    const { data, error } = await admin
      .schema("auth")
      .from("users")
      .select("id,email")
      .eq("email", email)
      .limit(1);

    if (error) throw error;
    return (data?.[0] as any)?.id ?? null;
  } catch {
    // Fallback listUsers paging
    let page = 1;
    const perPage = 1000;
    while (page <= 10) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) break;
      const match = (data.users ?? []).find((u: any) => String(u.email || "").toLowerCase() === email);
      if (match) return match.id;
      if (!data.users || data.users.length < perPage) break;
      page += 1;
    }
    return null;
  }
}

async function authUserExists(admin: any, userId: string) {
  if (!userId) return false;
  // Best: getUserById (fast)
  try {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error) return false;
    return !!data?.user?.id;
  } catch {
    return false;
  }
}

export const handler: Handler = async (event) => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json(500, { error: "Trūkst SUPABASE_URL vai SUPABASE_SERVICE_ROLE_KEY (Netlify env)." });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminCheck = await requireAdmin(event, admin);
  if (!adminCheck.ok) return json(adminCheck.status, { error: adminCheck.message });

  try {
    const method = (event.httpMethod || "GET").toUpperCase();

    // ---------------- GET (list access rows + email) ----------------
    if (method === "GET") {
      const search = (event.queryStringParameters?.search || "").trim();

      let q = admin
        .from("user_access")
        .select("user_id, active, never_expires, expires_at, note, is_admin, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (search) {
        const s = search.replace(/%/g, "");
        q = q.or(`user_id.ilike.%${s}%,note.ilike.%${s}%`);
      }

      const { data, error } = await q;
      if (error) return json(500, { error: error.message });

      const enriched = await attachEmails(admin, (data ?? []) as UA[]);

      if (search) {
        const s = search.toLowerCase();
        const filtered = enriched.filter((r) => {
          return (
            (r.user_id || "").toLowerCase().includes(s) ||
            (r.note || "").toLowerCase().includes(s) ||
            (r.email || "").toLowerCase().includes(s)
          );
        });
        return json(200, { rows: filtered });
      }

      return json(200, { rows: enriched });
    }

    // ---------------- POST (create auth user OR grant access) ----------------
    if (method === "POST") {
      const body = event.body ? JSON.parse(event.body) : {};
      const action = String(body.action || "").trim();

      // A) Create auth user only
      if (action === "create_auth_user") {
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");

        if (!email) return json(400, { error: "Trūkst e-pasts." });
        if (!password || password.length < 6) return json(400, { error: "Parolei jābūt vismaz 6 simboli." });

        // If already exists, return id (no creation)
        const existingId = await findAuthUserIdByEmail(admin, email);
        if (existingId) {
          return json(200, { user: { id: existingId, email, existed: true } });
        }

        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createErr || !created?.user?.id) {
          return json(500, { error: createErr?.message || "Neizdevās izveidot Auth user." });
        }

        return json(200, { user: { id: created.user.id, email, existed: false } });
      }

      // B) Grant / upsert access (requires existing auth user)
      if (action === "grant_access") {
        const user_id = String(body.user_id || "").trim();
        const email = String(body.email || "").trim();
        const access = body.access || {};

        let resolvedUserId = user_id;

        if (!resolvedUserId && email) {
          const idByEmail = await findAuthUserIdByEmail(admin, email);
          if (!idByEmail) {
            return json(400, { error: "Lietotājs ar šādu e-pastu neeksistē Auth sistēmā. Vispirms izveido Auth user." });
          }
          resolvedUserId = idByEmail;
        }

        if (!resolvedUserId) return json(400, { error: "Nepietiek datu: user_id vai e-pasts." });

        const exists = await authUserExists(admin, resolvedUserId);
        if (!exists) {
          return json(400, { error: "Šāds user_id neeksistē Supabase Auth. Vispirms izveido Auth user." });
        }

        const row: UA = {
          user_id: resolvedUserId,
          active: access.active !== false,
          never_expires: access.never_expires !== false,
          expires_at: access.never_expires ? null : (access.expires_at ?? null),
          note: access.note ? String(access.note).trim() : null,
          is_admin: access.is_admin === true,
        };

        if (row.is_admin) {
          const { error: e1 } = await admin.from("user_access").update({ is_admin: false }).neq("user_id", row.user_id);
          if (e1) return json(500, { error: e1.message });
        }

        const { data, error } = await admin
          .from("user_access")
          .upsert(row, { onConflict: "user_id" })
          .select("*")
          .limit(1);

        if (error) {
          const msg = String(error.message || "");
          if (msg.toLowerCase().includes("violates foreign key constraint")) {
            return json(400, { error: "FK kļūda: user_id neeksistē referenced tabulā. Vispirms izveido Auth user." });
          }
          return json(500, { error: error.message });
        }

        const rowWithEmail = (await attachEmails(admin, [(data?.[0] ?? null) as any].filter(Boolean) as UA[]))?.[0] ?? null;
        return json(200, { row: rowWithEmail });
      }

      // Backward compatibility (old behavior): insert access directly by user_id
      const row: UA = {
        user_id: String(body.user_id || "").trim(),
        active: body.active !== false,
        never_expires: body.never_expires !== false,
        expires_at: body.never_expires ? null : (body.expires_at ?? null),
        note: body.note ? String(body.note).trim() : null,
        is_admin: body.is_admin === true,
      };

      if (!row.user_id) return json(400, { error: "user_id ir obligāts." });

      const exists = await authUserExists(admin, row.user_id);
      if (!exists) {
        return json(400, { error: "Šāds user_id neeksistē Supabase Auth. Vispirms izveido Auth user." });
      }

      if (row.is_admin) {
        const { error: e1 } = await admin.from("user_access").update({ is_admin: false }).neq("user_id", row.user_id);
        if (e1) return json(500, { error: e1.message });
      }

      const { data, error } = await admin.from("user_access").upsert(row, { onConflict: "user_id" }).select("*").limit(1);
      if (error) return json(500, { error: error.message });

      const rowWithEmail = (await attachEmails(admin, [(data?.[0] ?? null) as any].filter(Boolean) as UA[]))?.[0] ?? null;
      return json(200, { row: rowWithEmail });
    }

    // ---------------- PATCH ----------------
    if (method === "PATCH") {
      const body = event.body ? JSON.parse(event.body) : {};
      const user_id = String(body.user_id || "").trim();
      const patch = body.patch || {};

      if (!user_id) return json(400, { error: "user_id ir obligāts." });

      const normalized: Partial<UA> = {};
      if (typeof patch.active === "boolean") normalized.active = patch.active;
      if (typeof patch.never_expires === "boolean") normalized.never_expires = patch.never_expires;
      if ("expires_at" in patch) normalized.expires_at = patch.expires_at ? String(patch.expires_at) : null;
      if ("note" in patch) normalized.note = patch.note ? String(patch.note).trim() : null;
      if (typeof patch.is_admin === "boolean") normalized.is_admin = patch.is_admin;

      if (normalized.is_admin === true) {
        const { error: e1 } = await admin.from("user_access").update({ is_admin: false }).neq("user_id", user_id);
        if (e1) return json(500, { error: e1.message });
      }

      if (normalized.is_admin === false) {
        const { data: admins, error: e } = await admin.from("user_access").select("user_id").eq("is_admin", true);
        if (e) return json(500, { error: e.message });
        const adminCount = (admins ?? []).length;
        const isTargetAdmin = (admins ?? []).some((a: any) => a.user_id === user_id);
        if (isTargetAdmin && adminCount <= 1) {
          return json(400, { error: "Nevar noņemt pēdējo administratoru." });
        }
      }

      const { data, error } = await admin.from("user_access").update(normalized).eq("user_id", user_id).select("*").limit(1);
      if (error) return json(500, { error: error.message });

      const rowWithEmail = (await attachEmails(admin, [(data?.[0] ?? null) as any].filter(Boolean) as UA[]))?.[0] ?? null;
      return json(200, { row: rowWithEmail });
    }

    // ---------------- DELETE ----------------
    if (method === "DELETE") {
      const body = event.body ? JSON.parse(event.body) : {};
      const user_id = String(body.user_id || "").trim();
      if (!user_id) return json(400, { error: "user_id ir obligāts." });

      const { data: admins, error: e } = await admin.from("user_access").select("user_id").eq("is_admin", true);
      if (e) return json(500, { error: e.message });
      const adminCount = (admins ?? []).length;
      const isTargetAdmin = (admins ?? []).some((a: any) => a.user_id === user_id);
      if (isTargetAdmin && adminCount <= 1) {
        return json(400, { error: "Nevar dzēst pēdējo administratoru." });
      }

      const { error } = await admin.from("user_access").delete().eq("user_id", user_id);
      if (error) return json(500, { error: error.message });

      return json(200, { ok: true });
    }

    return json(405, { error: "Metode nav atļauta." });
  } catch (e: any) {
    return json(500, { error: e?.message || "Nezināma kļūda." });
  }
};
