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

export const topicsApi = {
  list: () => authedFetch("/.netlify/functions/admin-topics"),

  create: (payload: any) =>
    authedFetch("/.netlify/functions/admin-topics", { method: "POST", body: JSON.stringify(payload) }),

  update: (payload: any) =>
    authedFetch("/.netlify/functions/admin-topics", { method: "PATCH", body: JSON.stringify(payload) }),

  delete: (id: string) =>
    authedFetch("/.netlify/functions/admin-topics", { method: "DELETE", body: JSON.stringify({ id }) }),
};