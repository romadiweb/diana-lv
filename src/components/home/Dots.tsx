type DotsProps = {
  count: number;
  activeIndex: number;
  onSelect: (i: number) => void;
};

export default function Dots({ count, activeIndex, onSelect }: DotsProps) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => onSelect(i)}
            className={[
              "h-3 w-3 rounded-full border transition",
              active ? "bg-white border-white" : "bg-white/30 border-white/60 hover:bg-white/60",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
