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

export const choicesApi = {
  listByQuestion: (question_id: string) =>
    authedFetch(`/.netlify/functions/admin-choices?question_id=${encodeURIComponent(question_id)}`),

  create: (payload: any) =>
    authedFetch("/.netlify/functions/admin-choices", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (payload: any) =>
    authedFetch("/.netlify/functions/admin-choices", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  delete: (id: string) =>
    authedFetch("/.netlify/functions/admin-choices", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};