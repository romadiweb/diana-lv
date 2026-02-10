import { Facebook } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-fog/60 bg-[#3F2021]">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between py-4 text-sm text-[#FBF8F5]">
          <div>
            © {new Date().getFullYear()} Visas tiesības aizsargātas *domēns* | Mājaslapu
            veidoja{" "}
            <a
              href="https://romadi.lv"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline underline-offset-4 hover:opacity-90"
            >
              romadi.lv
            </a>
          </div>

          <a
            href="https://www.facebook.com/veikalsdiana/?locale=lv_LV"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-white/80 hover:text-white hover:scale-110 transition-transform"
          >
            <Facebook className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}
