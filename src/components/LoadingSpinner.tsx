export default function LoadingSpinner({
  label = "Ielādē…",
  subLabel = "Lūdzu uzgaidi.",
}: {
  label?: string;
  subLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="
          h-12 w-12 rounded-full
          border-4 border-[#3F2021]/20
          border-t-[#3F2021]
          animate-spin
        "
        aria-label="Ielādē"
      />
      <div className="text-base font-semibold text-cocoa">{label}</div>
      {subLabel && (
        <div className="text-sm text-cocoa/70">{subLabel}</div>
      )}
    </div>
  );
}
