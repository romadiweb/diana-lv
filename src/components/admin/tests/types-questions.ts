export type QuestionRow = {
  id: string;
  topic_id: string;
  text: string;
  image_url: string | null;
  image_alt: string | null;
  multiple: boolean;
  explanation: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};