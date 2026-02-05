export default function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[#DBDEE4] bg-white p-4 shadow-sm">
      <p className="text-xs text-cocoa/70">{label}</p>
      <p className="mt-1 text-xl font-semibold text-cocoa">{value}</p>
    </div>
  );
}