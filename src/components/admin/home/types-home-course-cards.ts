export type Course = {
  id: string;
  content: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  href: string | null;
  slug: string | null;
  active: boolean;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  price_amount: number | null;
  price_currency: string | null;
};