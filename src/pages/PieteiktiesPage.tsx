import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageHeader from "../layout/PageHeader";

type Course = { id: string; title: string; active: boolean; sort_order: number | null };

type FormState = {
  courseId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  availability: string;
  notes: string;
  referral: string;
};

export default function PieteiktiesPage() {
  const [searchParams] = useSearchParams();
  const courseFromUrl = searchParams.get("course");

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    courseId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    availability: "",
    notes: "",
    referral: "",
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingCourses(true);
      setCoursesError(null);

      const { data, error } = await supabase
        .from("home_course_cards")
        .select("id,title,active,sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("title", { ascending: true });

      if (!mounted) return;

      if (error) {
        setCoursesError(error.message);
        setCourses([]);
      } else {
        const items = (data ?? []) as Course[];
        setCourses(items);

        const isValidUrlCourse = courseFromUrl && items.some((c) => c.id === courseFromUrl);

        setForm((prev) => ({
          ...prev,
          courseId: isValidUrlCourse
            ? (courseFromUrl as string)
            : prev.courseId || items[0]?.id || "",
        }));
      }

      setLoadingCourses(false);
    })();

    return () => {
      mounted = false;
    };
  }, [courseFromUrl]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // hook your submit here (supabase insert / api / email)
    alert("Demo: pieteikums nosūtīts!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <PageHeader
        title="Pieteikšanās forma"
        backgroundImageUrl="/jaunumi.jpg"
        subtitle="Aizpildi formu un mēs sazināsimies par tuvāko pieejamo laiku."
        crumbs={[{ label: "Sākums", href: "/" }, { label: "Pieteikties" }]}
        rightBadgeText="Ātri un vienkārši"
      />

      <main>
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-12">
          <div className="mx-auto w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800">Izvēlies pakalpojumu</label>

                <div className="relative">
                  <select
                    value={form.courseId}
                    onChange={(e) => setField("courseId", e.target.value)}
                    disabled={loadingCourses || !!coursesError}
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm text-neutral-900 outline-none transition focus:border-neutral-400"
                  >
                    {loadingCourses && <option>Notiek ielāde…</option>}
                    {!loadingCourses && courses.length === 0 && (
                      <option value="">Nav pieejamu pakalpojumu</option>
                    )}
                    {!loadingCourses &&
                      courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 10l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {coursesError && (
                  <p className="text-sm text-red-600">Neizdevās ielādēt: {coursesError}</p>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-800">Vārds</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-800">Uzvārds</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-neutral-800">E-pasts</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                />
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-neutral-800">Tālruņa numurs</label>
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                />
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-neutral-800">Dzīves vieta</label>
                <input
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                />
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-neutral-800">Kad vari apmeklēt?</label>
                <input
                  value={form.availability}
                  onChange={(e) => setField("availability", e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                />
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-neutral-800">Papildu informācija</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  className="min-h-[110px] w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                />
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-neutral-800">Kur uzzināji par mums?</label>
                <textarea
                  value={form.referral}
                  onChange={(e) => setField("referral", e.target.value)}
                  className="min-h-[90px] w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400"
                />
              </div>

              <div className="mt-6 flex items-center justify-end">
                <button
                  type="submit"
                  className="rounded-full px-6 py-3 text-sm font-semibold bg-neutral-900 text-white transition hover:opacity-90 active:scale-[0.99]"
                >
                  Pieteikties
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
