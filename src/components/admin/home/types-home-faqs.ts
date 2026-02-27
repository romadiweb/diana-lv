export type HomeFaq = {
  id: string;
  question: string;
  answer: string | null;
  active: boolean;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};