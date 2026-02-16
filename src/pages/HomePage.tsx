import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import type { Article, CourseCard, FaqItem, HeroSlide } from "../types/home";

import CoursesGrid from "../components/home/CoursesGrid";
import FaqSection from "../components/home/FaqSection";
import HeroSlider from "../components/home/HeroSlider";
import LogoBelt, { type BeltLogo } from "../components/home/LogoBelt";
import NewsSection from "../components/home/NewsSection";
import ScrollDownHint from "../components/home/ScrollDownHint";

export default function HomePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const [slidesRes, coursesRes, faqsRes, articlesRes] = await Promise.all([
        supabase.from("home_hero_slides").select("*"),
        supabase.from("home_course_cards").select("*"),
        supabase.from("home_faqs").select("*"),
        supabase.from("home_articles").select("*"),
      ]);

      if (!mounted) return;

      if (!slidesRes.error && slidesRes.data) setSlides(slidesRes.data as HeroSlide[]);
      if (!coursesRes.error && coursesRes.data) setCourses(coursesRes.data as CourseCard[]);
      if (!faqsRes.error && faqsRes.data) setFaqs(faqsRes.data as FaqItem[]);
      if (!articlesRes.error && articlesRes.data) setArticles(articlesRes.data as Article[]);

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // -------------------------
  // Fallbacks (ja DB tukšs)
  // -------------------------
  const fallbackSlides: HeroSlide[] = [
    {
      id: "local-1",
      title: "Medības sākas ar zināšanām. Turpinās ar cieņu. Un kļūst par dzīves daļu.",
      subtitle: "",
      cta_text: "Pieteikties",
      cta_href: "/kursi",
      image_url: "/hero/hero-1.jpg",
      active: true,
      sort_order: 1,
    },
  ];

  const fallbackCourses: CourseCard[] = [
    {
      id: "c1",
      title: "MEDNIEKU KURSI KLĀTIENĒ",
      description: "Mednieku kursi klātienē ar strukturētu teorijas nodarbību programmu.",
      href: "/kursi",
      active: true,
      sort_order: 1,
      price_amount: 200,
      slug: "mednieku-kursi-klatiene",
      price_currency: "€",
    },
    {
      id: "c2",
      title: "TIEŠSAISTES MEDNIEKU KURSI ZOOM PLATFORMĀ",
      description: "Mednieku kursi tiešsaistē ar skaidri strukturētu teorijas programmu.",
      href: "/kursi",
      active: true,
      sort_order: 2,
      price_amount: 200,
      slug: "tiessaistes-mednieku-kursi-zoom",
      price_currency: "€",
    },
    {
      id: "c3",
      title: "MEDNIEKU EKSĀMENA TESTS",
      description:
        "Valsts meža dienesta eksāmena simulācija ar šobrīd spēkā esošiem jautājumiem un atbildēm.",
      href: "/tests",
      active: true,
      sort_order: 3,
      price_amount: 10,
      slug: "mednieku-eksamena-tests",
      price_currency: "€",
    },
  ];

  const fallbackFaqs: FaqItem[] = [
    {
      id: "f1",
      question: "Kā kļūt par mednieku?",
      answer: "Šeit būs detalizēta atbilde (vēlāk vari ielikt DB).",
      active: true,
      sort_order: 1,
    },
    {
      id: "f2",
      question: "Kā kļūt par medību vadītāju?",
      answer: "Šeit būs detalizēta atbilde (vēlāk vari ielikt DB).",
      active: true,
      sort_order: 2,
    },
    {
      id: "f3",
      question: "Par eksāmenu! Kā pieteikties mednieka eksāmenam?",
      answer: "Šeit būs detalizēta atbilde (vēlāk vari ielikt DB).",
      active: true,
      sort_order: 3,
    },
  ];

  const fallbackArticles: Article[] = [
    {
      id: "a1",
      title: "Latvijas mežā nejauši sastapti lāču mazuļi",
      excerpt:
        "Brūnais lācis Ursus arctos… īss ievads par situāciju un ko svarīgi zināt medniekiem.",
      content: null,
      published_at: new Date().toISOString(),
      image_url: null,
      href: null,
      active: true,
      sort_order: 1,
      slug: "raksts-1",
    },
    {
      id: "a2",
      title: "Par izmaiņām MK noteikumos Nr. 567",
      excerpt:
        "Kas mainās un ko tas nozīmē medniekiem un medību vadītājiem. Īss kopsavilkums…",
      content: null,
      published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      image_url: null,
      href: null,
      active: true,
      sort_order: 2,
      slug: "raksts-2",
    },
  ];

  // -------------------------
  // Logo belt (static, swipe on mobile)
  // -------------------------
  const logos: BeltLogo[] = [
    { id: "p1", name: "Partner 1", href: "https://tikka-rifles.com", src: "/partners/tikka.png" },
    { id: "p2", name: "Partner 2", href: "https://berettaaustralia.com.au", src: "/partners/beretta.png" },
    { id: "p3", name: "Partner 3", href: "https://sako.global", src: "/partners/sako.png" },
    { id: "p4", name: "Partner 4", href: "https://www.thermeyetec.com", src: "/partners/thermtec.png" },
    { id: "p5", name: "Partner 5", href: "https://www.browning.eu", src: "/partners/browning.png" },
  ];

  const slidesToUse = slides.length ? slides : fallbackSlides;
  const coursesToUse = courses.length ? courses : fallbackCourses;
  const faqsToUse = faqs.length ? faqs : fallbackFaqs;
  const articlesToUse = articles.length ? articles : fallbackArticles;

  return (
    <main>
      {/* Hero (arrow on top of hero only) */}
      <div className="relative">
        <HeroSlider slides={slidesToUse} />
        <ScrollDownHint targetId="courses" fadeAfterPx={60} />
      </div>

      {/* Logo belt under hero */}
      <LogoBelt items={logos} className="py-10" heightPx={46} />

      {/* Scroll target for arrow */}
      <div id="courses">
        {!loading ? <CoursesGrid items={coursesToUse} /> : null}

        {/* FAQ under courses */}
        <FaqSection items={faqsToUse} />

        {/* JAUNUMI under FAQ */}
        <NewsSection
          items={articlesToUse}
          backgroundImageUrl="jaunumi.jpg"
          title="JAUNUMI"
          subtitle="Par jauno un aktuālo medniekam"
        />
      </div>
    </main>
  );
}
