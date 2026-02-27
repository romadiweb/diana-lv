import { supabase } from "../../../lib/supabase";

async function authedFetch(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Nav sesijas. Ielogojies vēlreiz.");

  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Kļūda (${res.status})`);
  return json;
}

export const questionsApi = {
  list: (params: { page: number; pageSize: number; search?: string; topic_id?: string }) => {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page));
    qs.set("pageSize", String(params.pageSize));
    if (params.search) qs.set("search", params.search);
    if (params.topic_id) qs.set("topic_id", params.topic_id);
    return authedFetch(`/.netlify/functions/admin-questions?${qs.toString()}`);
  },

  create: (payload: any) =>
    authedFetch("/.netlify/functions/admin-questions", { method: "POST", body: JSON.stringify(payload) }),

  update: (payload: any) =>
    authedFetch("/.netlify/functions/admin-questions", { method: "PATCH", body: JSON.stringify(payload) }),

  delete: (id: string) =>
    authedFetch("/.netlify/functions/admin-questions", { method: "DELETE", body: JSON.stringify({ id }) }),
};