export type HeroSlide = {
  id: string;
  title: string;
  subtitle?: string | null;
  cta_text?: string | null;
  cta_href?: string | null;
  image_url: string;
  active: boolean;
  sort_order: number;
};

export type CourseCard = {
  id: string;
  title: string;
  description?: string | null;
  icon?: "antlers" | "binoculars" | "horn" | string | null;
  href?: string | null;
  active: boolean;
  sort_order: number;

  price_amount?: number | null;
  price_currency?: string | null;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  sort_order: number;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  published_at: string; // timestamptz
  image_url: string | null;
  href: string | null; // optional external or internal link
  active: boolean;
  sort_order: number;
};
