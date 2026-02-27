export type TopicRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number | null;
  created_at: string | null;
};