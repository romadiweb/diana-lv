export default function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-semibold text-neutral-900">{title}</h2>
      {subtitle ? <p className="mt-2 text-neutral-600">{subtitle}</p> : null}
    </div>
  );
}
