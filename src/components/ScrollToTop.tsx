import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Uz augšu"
      className="
        fixed bottom-6 right-6 z-50
        rounded-full bg-[#3F2021] p-3
        text-white shadow-lg
        transition-all duration-300
        hover:scale-110 hover:bg-[#552b2c] hover:cursor-pointer
        focus:outline-none
      "
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
