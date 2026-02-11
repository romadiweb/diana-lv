import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { CourseCard, HeroSlide } from "../types/home";
import HeroSlider from "../components/home/HeroSlider";
import CoursesGrid from "../components/home/CoursesGrid";
import ScrollDownHint from "../components/home/ScrollDownHint";
import LogoBelt, { type BeltLogo } from "../components/home/LogoBelt";

export default function HomePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const [slidesRes, coursesRes] = await Promise.all([
        supabase.from("home_hero_slides").select("*"),
        supabase.from("home_course_cards").select("*"),
      ]);

      if (!mounted) return;

      if (!slidesRes.error && slidesRes.data) setSlides(slidesRes.data as HeroSlide[]);
      if (!coursesRes.error && coursesRes.data) setCourses(coursesRes.data as CourseCard[]);

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const fallbackSlides: HeroSlide[] = [
    {
      id: "local-1",
      title:
        "Medības nav tikai hobijs un vaļasprieks! Medības ir dzīvesveids, sirdslieta un arī pienākums!",
      subtitle: "",
      cta_text: "Pieteikties",
      cta_href: "/kursi",
      image_url: "/hero/hero-1.jpg",
      active: true,
      sort_order: 1,
    },
  ];

  const fallbackCourses: CourseCard[] = [
    { id: "c1", title: "MEDNIEKU KURSI KLĀTIENĒ", description: "Apmācības klātienē ar pasniedzējiem.", href: "/kursi", active: true, sort_order: 1 },
    { id: "c2", title: "TIEŠSAISTES (ZOOM) KURSI", description: "Mācības attālināti — ērti no mājām.", href: "/kursi", active: true, sort_order: 2 },
    { id: "c3", title: "MEDNIEKU KURSI INTERNETĀ", description: "Pašmācība ar materiāliem un testiem.", href: "/kursi", active: true, sort_order: 3 },
  ];
  const logos: BeltLogo[] = [
    { id: "p1", name: "Partner 1", href: "https://example.com", src: "/logos/partner1.png" },
    { id: "p2", name: "Partner 2", href: "https://example.com", src: "/logos/partner2.png" },
    { id: "p3", name: "Partner 3", href: "https://example.com", src: "/logos/partner3.png" },
    { id: "p4", name: "Partner 4", href: "https://example.com", src: "/logos/partner4.png" },
    { id: "p5", name: "Partner 5", href: "https://example.com", src: "/logos/partner5.png" },
  ];
  return (
    <main>
      {/* Hero wrapper so arrow can be positioned at bottom */}
      <div className="relative">
        <HeroSlider slides={slides.length ? slides : fallbackSlides} />
        <ScrollDownHint targetId="courses" fadeAfterPx={60} />
        <LogoBelt items={logos} className="py-10" heightPx={46} />
      </div>

      {/* Scroll target for the arrow */}
      <div id="courses">
        {loading ? null : <CoursesGrid items={courses.length ? courses : fallbackCourses} />}
        {!loading && courses.length === 0 ? <CoursesGrid items={fallbackCourses} /> : null}
      </div>
    </main>
  );
}
