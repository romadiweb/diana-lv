import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  /** Element id to scroll to when clicking the arrow (example: "courses") */
  targetId?: string;
  /** After how many px of scroll should the arrow fade out */
  fadeAfterPx?: number;
};

export default function ScrollDownHint({ targetId = "courses", fadeAfterPx = 60 }: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setHidden(window.scrollY > fadeAfterPx);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fadeAfterPx]);

  const onClick = () => {
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll down"
      className={[
        "absolute bottom-6 left-1/2 -translate-x-1/2 z-30",
        "flex items-center justify-center",
        "h-12 w-12 rounded-full",
        "bg-[#BA8448] backdrop-blur border border-[#BA8448]/60 shadow-sm",
        "transition-all duration-500",
        "hover:bg-[#BA8448] hover:border-[#BA8448]/60 animate-bounce hover:cursor-pointer",
        hidden ? "opacity-0 pointer-events-none translate-y-2" : "opacity-100",
      ].join(" ")}
    >
      <ChevronDown className="h-6 w-6 text-white" />
    </button>
  );
}
