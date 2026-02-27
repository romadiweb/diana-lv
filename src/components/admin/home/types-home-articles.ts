export type HomeArticle = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;          // HTML allowed
  published_at: string | null;     // timestamptz ISO
  image_url: string | null;
  href: string | null;
  active: boolean;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};