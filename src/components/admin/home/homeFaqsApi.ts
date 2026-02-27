import { supabase } from "../../../lib/supabase";

async function authedFetch(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Nav sesijas.");

  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Kļūda (${res.status})`);
  return json;
}

export const homeFaqsApi = {
  list: () => authedFetch("/.netlify/functions/admin-home-faqs"),

  create: (payload: any) =>
    authedFetch("/.netlify/functions/admin-home-faqs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (payload: any) =>
    authedFetch("/.netlify/functions/admin-home-faqs", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    authedFetch("/.netlify/functions/admin-home-faqs", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};