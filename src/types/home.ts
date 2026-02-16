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
  icon?: string | null;
  href?: string | null;
  active: boolean;
  sort_order: number;
  slug: string;
  content?: string | null;

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
  slug: string | null;
  title: string;
  excerpt: string | null;
  content: string | null;
  published_at: string;
  image_url: string | null;
  href: string | null;
  active: boolean;
  sort_order: number;
};

