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

    // If user clicked a topic before, continue where they left off
    if (pendingTopicSlug) {
      const slug = pendingTopicSlug;
      setPendingTopicSlug(null);
      navigate(`/mednieku-tests/${slug}`);
      return;
    }

    // Otherwise open topic picker
    setTopicModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <main className="flex-1 flex">
        <section className="relative overflow-hidden flex-1 flex items-center" id="sakt">
          <div className="absolute inset-0">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blush/70 blur-2xl" />
            <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-fog/70 blur-2xl" />
          </div>

          <div className="mx-auto w-full px-4 py-10 sm:px-6 lg:px-10 md:py-14">
            <div className="relative grid items-start gap-10 md:grid-cols-2">
              <div>
                <HeroSection
                  topicsCount={topics.length}
                  totalQuestionsCount={totalQuestionsCount}
                  onStartTest={openStartFlow}
                  onOpenCourses={() => setCourseModalOpen(true)}
                />

                {topicsLoading && <div className="mt-4 text-sm text-cocoa/70">Ielādē tēmas…</div>}
                {topicsError && (
                  <div className="mt-4 text-sm text-red-700">
                    Neizdevās ielādēt tēmas: {topicsError}
                  </div>
                )}
              </div>

              <div className="md:pt-2">
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
        </section>
      </main>

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
