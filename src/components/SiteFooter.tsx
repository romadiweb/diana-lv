export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-fog/60 bg-[#3F2021]">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-10">
        <div className="py-4 text-sm text-[#FBF8F5]">
          © {new Date().getFullYear()} Visas tiesības aizsargātas *domēns* | Mājaslapu
          veidoja{" "}
          <a
            href="https://romadi.lv"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-4 hover:opacity-90 text-[#FBF8F5]"
          >
            romadi.lv
          </a>
        </div>
      </div>
    </footer>
  );
}