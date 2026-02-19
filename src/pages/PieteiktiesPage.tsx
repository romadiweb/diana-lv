import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import { supabase } from "../lib/supabase";
import CaptchaTurnstile from "../components/global/CaptchaTurnstile";

type Course = {
  id: string;
  slug: string;
  title: string;
  active: boolean;
  sort_order: number | null;
};

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
  const { courseSlug } = useParams<{ courseSlug?: string }>();
  const [searchParams] = useSearchParams();
  const courseIdFromQuery = searchParams.get("course");

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

  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string;
  const [captchaToken, setCaptchaToken] = useState("");
  const [sending, setSending] = useState(false);

  const showSkeleton = useMemo(
    () => loadingCourses && courses.length === 0,
    [loadingCourses, courses.length]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      setCoursesError(null);
      setLoadingCourses(true);

      const { data, error } = await supabase
        .from("home_course_cards")
        .select("id,slug,title,active,sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("title", { ascending: true });

      if (!mounted) return;

      if (error) {
        setCoursesError(error.message);
        setLoadingCourses(false);
        return;
      }

      const items = (data ?? []) as Course[];
      setCourses(items);

      // Preselect priority:
      // 1) route slug (/pieteikties/:courseSlug)
      // 2) query (?course=<id>)
      // 3) keep previous if still valid
      // 4) first item
      const decodedSlug = courseSlug ? decodeURIComponent(courseSlug) : null;
      const matchedBySlug = decodedSlug ? items.find((c) => c.slug === decodedSlug) : null;
      const matchedById = courseIdFromQuery ? items.find((c) => c.id === courseIdFromQuery) : null;

      const prevStillValid = items.some((c) => c.id === form.courseId);

      const nextCourseId =
        matchedBySlug?.id ??
        matchedById?.id ??
        (prevStillValid ? form.courseId : "") ??
        items[0]?.id ??
        "";

      setForm((prev) => ({ ...prev, courseId: nextCourseId }));
      setLoadingCourses(false);
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug, courseIdFromQuery]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedCourseTitle = useMemo(() => {
    const c = courses.find((x) => x.id === form.courseId);
    return c?.title ?? "Pieteikšanās";
  }, [courses, form.courseId]);

  const selectedCourse = useMemo(() => {
    return courses.find((x) => x.id === form.courseId) ?? null;
  }, [courses, form.courseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.courseId) return alert("Lūdzu izvēlies pakalpojumu.");
    if (!form.email) return alert("Lūdzu ievadi e-pastu.");
    if (!captchaToken) return alert("Lūdzu apstiprini, ka neesi robots.");

    try {
      setSending(true);

      const payload = {
        captchaToken,
        form: {
          courseId: form.courseId,
          courseName: selectedCourse?.title ?? "",
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          availability: form.availability,
          notes: form.notes,
          referral: form.referral,
        },
      };

      const res = await fetch("/.netlify/functions/send-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Neizdevās nosūtīt pieteikumu.");
      }

      alert("Pieteikums nosūtīts! Mēs sazināsimies drīzumā.");

      // reset fields (keep course selection)
      setCaptchaToken("");
      setForm((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        availability: "",
        notes: "",
        referral: "",
      }));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Kļūda nosūtot pieteikumu.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-sand">
      <PageHeader
        title={selectedCourseTitle}
        subtitle="Aizpildi formu un mēs ar Tevi sazināsimies."
        backgroundImageUrl="/jaunumi.jpg"
        crumbs={[{ label: "Sākums", href: "/" }, { label: "Pieteikties" }]}
      />

      <section>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-14">
          <div className="rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-8 shadow-[0_14px_50px_rgba(0,0,0,0.08)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-cocoa">Izvēlies pakalpojumu</label>

                {showSkeleton ? (
                  <div className="h-12 w-full animate-pulse rounded-xl bg-black/5" />
                ) : (
                  <>
                    <div className="relative">
                      <select
                        value={form.courseId}
                        onChange={(e) => setField("courseId", e.target.value)}
                        disabled={loadingCourses || !!coursesError}
                        className="w-full appearance-none rounded-xl border border-black/10 bg-white px-4 py-3 pr-10 text-sm text-cocoa outline-none transition focus:border-black/20"
                      >
                        {loadingCourses && courses.length === 0 && <option>Notiek ielāde…</option>}
                        {!loadingCourses && courses.length === 0 && (
                          <option value="">Nav pieejamu pakalpojumu</option>
                        )}

                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-cocoa/60">
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

                    {coursesError && <p className="text-sm text-red-700">Neizdevās ielādēt: {coursesError}</p>}
                  </>
                )}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Vārds">
                  <input
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa outline-none focus:border-black/20"
                  />
                </Field>

                <Field label="Uzvārds">
                  <input
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa outline-none focus:border-black/20"
                  />
                </Field>
              </div>

              <Field label="E-pasts *">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa outline-none focus:border-black/20"
                />
              </Field>

              <Field label="Tālrunis">
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa outline-none focus:border-black/20"
                />
              </Field>

              <Field label="Dzīves vieta">
                <input
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa outline-none focus:border-black/20"
                />
              </Field>

              <Field label="Kad vari apmeklēt?">
                <input
                  value={form.availability}
                  onChange={(e) => setField("availability", e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa outline-none focus:border-black/20"
                />
              </Field>

              <Field label="Papildu informācija">
                <textarea
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  className="min-h-[120px] w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa outline-none focus:border-black/20"
                />
              </Field>

              <Field label="Kur uzzināji par mums?">
                <textarea
                  value={form.referral}
                  onChange={(e) => setField("referral", e.target.value)}
                  className="min-h-[90px] w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa outline-none focus:border-black/20"
                />
              </Field>

              {/* CAPTCHA */}
              <CaptchaTurnstile
                siteKey={TURNSTILE_SITE_KEY}
                onToken={(t) => setCaptchaToken(t)}
                onExpire={() => setCaptchaToken("")}
                onError={() => setCaptchaToken("")}
              />

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending || !captchaToken}
                  className="rounded-full bg-[#3F2021] px-7 py-3 text-sm font-semibold text-white shadow-sm transition
                             hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sūta..." : "Pieteikties"}
                </button>
              </div>

              <p className="text-xs text-cocoa/55">
                Iesniedzot formu, Tu piekrīti, ka apstrādājam iesniegto informāciju saziņas nolūkā.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-cocoa">{label}</label>
      {children}
    </div>
  );
}
