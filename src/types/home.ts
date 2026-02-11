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
