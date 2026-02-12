import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import QuickPick from "../components/QuickPick";
import TopicModal from "../components/TopicModal";
import CourseModal from "../components/CourseModal";
import type { Topic } from "../components/TopicCard";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const navigate = useNavigate();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number | null>(
    null
  );

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setTopicsError(null);
      setTopicsLoading(true);

      // topics + count per topic
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
          // IMPORTANT: Topic.id is the slug (used for routing)
          id: t.slug,
          title: t.title,
          description: t.description ?? "",
          questionCount: t.questions?.[0]?.count ?? 0,
        })) ?? [];

      setTopics(mapped);
      setTopicsLoading(false);

      // total questions count for hero
      const { count, error: countErr } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true });

      if (!countErr) setTotalQuestionsCount(count ?? 0);
      else setTotalQuestionsCount(null);
    };

    load();
  }, []);

  function openStartFlow() {
    setTopicModalOpen(true);
  }

  function pickTopic(t: Topic) {
    // close modal if open
    setTopicModalOpen(false);

    // go to test page
    navigate(`/mednieku-tests/${t.id}`);
  }

  return (
    <div className="min-h-screen bg-sand flex flex-col">

      <main className="flex-1 flex">
        <section
          className="relative overflow-hidden flex-1 flex items-center"
          id="sakt"
        >
          <div className="absolute inset-0">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blush/70 blur-2xl" />
            <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-fog/70 blur-2xl" />
          </div>

          <div className="mx-auto w-full px-4 py-10 sm:px-6 lg:px-10 md:py-14">
            <div className="relative grid items-start gap-10 md:grid-cols-2">

              {/* LEFT */}
              <div>
                <HeroSection
                  topicsCount={topics.length}
                  totalQuestionsCount={totalQuestionsCount}
                  onStartTest={openStartFlow}
                  onOpenCourses={() => setCourseModalOpen(true)}
                />

                {topicsLoading && (
                  <div className="mt-4 text-sm text-cocoa/70">Ielādē tēmas…</div>
                )}
                {topicsError && (
                  <div className="mt-4 text-sm text-red-700">
                    Neizdevās ielādēt tēmas: {topicsError}
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="md:pt-2">
                <QuickPick
                  topics={topics}
                  onPickTopic={pickTopic}
                  onOpenAllTopics={() => setTopicModalOpen(true)}
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

      <CourseModal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
      />
    </div>
  );
}
