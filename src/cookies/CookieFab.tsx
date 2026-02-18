import { Cookie } from "lucide-react";
import { useCookieConsent } from "./CookieConsentProvider";

export default function CookieFab() {
  const { open } = useCookieConsent();

  return (
    <button
      onClick={open}
      aria-label="Sīkdatņu iestatījumi"
      className="
        fixed bottom-6 left-6 z-50
        rounded-full bg-[#BA8448] p-3
        text-white shadow-lg
        transition-all duration-300
        hover:scale-110 hover:cursor-pointer
        focus:outline-none
      "
    >
      <Cookie className="h-5 w-5" />
    </button>
  );
}
