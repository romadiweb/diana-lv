export default function AdminDenied() {
  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur">
        <h1 className="text-2xl font-semibold text-cocoa">Piekļuve liegta</h1>
        <p className="mt-2 text-sm text-cocoa/70">
          Šī sadaļa ir pieejama tikai administrātoram.
        </p>
      </div>
    </div>
  );
}
