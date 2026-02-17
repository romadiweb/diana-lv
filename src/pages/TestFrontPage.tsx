import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import QuickPick from "../components/QuickPick";
import TopicModal from "../components/TopicModal";
import CourseModal from "../components/CourseModal";
import type { Topic } from "../components/TopicCard";
import { supabase } from "../lib/supabase";
import { useAccess } from "../paywall/useAccess";
import PaywallModal from "../paywall/PaywallModal";
import PageHeader from "../layout/PageHeader";

export default function HomePage() {
  const navigate = useNavigate();

  const { status } = useAccess();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pendingTopicSlug, setPendingTopicSlug] = useState<string | null>(null);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number | null>(null);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setTopicsError(null);
      setTopicsLoading(true);

      const { data: topicsData, error: topicsErr } = await supabase
        .from("topics")
        .select(
          `
          id,
          slug,
          title,
          description,
          sort_order,
          questions(count)
        `
        )
        .order("sort_order", { ascending: true });

      if (topicsErr) {
        setTopicsError(topicsErr.message);
        setTopics([]);
        setTopicsLoading(false);
        return;
      }

      const mapped: Topic[] =
        (topicsData ?? []).map((t: any) => ({
          id: t.slug,
          title: t.title,
          description: t.description ?? "",
          questionCount: t.questions?.[0]?.count ?? 0,
        })) ?? [];

      setTopics(mapped);
      setTopicsLoading(false);

      const { count, error: countErr } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true });

      if (!countErr) setTotalQuestionsCount(count ?? 0);
      else setTotalQuestionsCount(null);
    };

    load();
  }, []);

  function ensureAccessOrOpenPaywall(nextTopicSlug?: string) {
    if (status.state === "allowed") return true;

    if (nextTopicSlug) setPendingTopicSlug(nextTopicSlug);
    setPaywallOpen(true);
    return false;
  }

  function openStartFlow() {
    if (!ensureAccessOrOpenPaywall()) return;
    setTopicModalOpen(true);
  }

  function pickTopic(t: Topic) {
    setTopicModalOpen(false);

    if (!ensureAccessOrOpenPaywall(t.id)) return;
    navigate(`/mednieku-tests/${t.id}`);
  }

  function onPaywallSuccess() {
    setPaywallOpen(false);

    if (pendingTopicSlug) {
      const slug = pendingTopicSlug;
      setPendingTopicSlug(null);
      navigate(`/mednieku-tests/${slug}`);
      return;
    }

    setTopicModalOpen(true);
  }


  return (
    <div className="min-h-screen bg-sand">
      {/* HEADER */}
      <PageHeader
        title="Mednieku tests"
        subtitle="Ātri pārbaudi zināšanas pēc tēmām vai sāc testu uzreiz. Izvēlies sev ērtāko veidu."
        crumbs={[{ label: "Sākums", href: "/" }, { label: "Mednieku tests" }]}
        rightBadgeText="Attīstība"
        // backgroundImageUrl="/images/your-header.jpg"
      />

      {/* MAIN */}
      <main className="relative">
        {/* subtle background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-blush/60 blur-3xl" />
          <div className="absolute -right-28 top-16 h-80 w-80 rounded-full bg-fog/60 blur-3xl" />
          <div className="absolute left-1/2 top-[520px] h-72 w-72 -translate-x-1/2 rounded-full bg-white/30 blur-3xl" />
        </div>

        <section className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

          {/* Main grid card */}
          <div className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur sm:p-7">
            <div className="grid items-start gap-8 md:grid-cols-2">
              {/* Left: hero */}
              <div className="min-w-0">
                <HeroSection
                  topicsCount={topics.length}
                  totalQuestionsCount={totalQuestionsCount}
                  onStartTest={openStartFlow}
                  onOpenCourses={() => setCourseModalOpen(true)}
                />

                {/* small helper text under hero */}
                <div className="mt-4 rounded-2xl border border-black/5 bg-white/60 p-4 text-sm text-cocoa/75">
                  Vari sākt ar <span className="font-semibold text-cocoa">ātro izvēli</span>,
                  vai atvērt <span className="font-semibold text-cocoa">visas tēmas</span>.
                </div>
              </div>

              {/* Right: quick pick */}
              <div className="md:pt-1">
                <div className="rounded-2xl border border-black/5 bg-white/60 p-4 sm:p-5">
                  <QuickPick
                    topics={topics}
                    onPickTopic={pickTopic}
                    onOpenAllTopics={() => {
                      if (!ensureAccessOrOpenPaywall()) return;
                      setTopicModalOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODALS */}
      <TopicModal
        open={topicModalOpen}
        topics={topics}
        onClose={() => setTopicModalOpen(false)}
        onPickTopic={pickTopic}
      />

      <CourseModal open={courseModalOpen} onClose={() => setCourseModalOpen(false)} />

      <PaywallModal
        open={paywallOpen}
        status={status}
        onClose={() => {
          setPaywallOpen(false);
          setPendingTopicSlug(null);
        }}
        onSuccess={onPaywallSuccess}
      />
    </div>
  );
}
