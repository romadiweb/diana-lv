import { supabase } from "./supabase";

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export type AdminProductPayload = {
  id?: string;
  category_id?: string | null;
  title: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  price_eur?: number | null;
  sku?: string | null;
  active?: boolean;
  sort_order?: number;
  imageDataUrl?: string; // optional
  imageAlt?: string;
};

export async function adminListProducts(includeInactive = true) {
  const headers = await authHeaders();
  const qs = includeInactive ? "?includeInactive=1" : "";
  const res = await fetch(`/.netlify/functions/admin-products${qs}`, { headers });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "Failed to load products");
  return j.rows as any[];
}

export async function adminCreateProduct(payload: AdminProductPayload) {
  const headers = await authHeaders();
  const res = await fetch(`/.netlify/functions/admin-products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "Failed to create product");
  return j.row;
}

export async function adminUpdateProduct(payload: AdminProductPayload & { id: string }) {
  const headers = await authHeaders();
  const res = await fetch(`/.netlify/functions/admin-products`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "Failed to update product");
  return j.row;
}

export async function adminDeleteProduct(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`/.netlify/functions/admin-products`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ id }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "Failed to delete product");
  return true;
}

export type AdminCategoryPayload = {
  id?: string;
  name: string;
  slug?: string;
  sort_order?: number;
};

export async function adminListCategories() {
  const headers = await authHeaders();
  const res = await fetch(`/.netlify/functions/admin-categories`, { headers });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "Failed to load categories");
  return j.rows as any[];
}

export async function adminCreateCategory(payload: AdminCategoryPayload) {
  const headers = await authHeaders();
  const res = await fetch(`/.netlify/functions/admin-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "Failed to create category");
  return j.row;
}

export async function adminDeleteCategory(id: string) {
  const headers = await authHeaders();
  const res = await fetch(`/.netlify/functions/admin-categories`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ id }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "Failed to delete category");
  return true;
}