import { useNavigate } from "react-router-dom";

export default function QuizSetupModal({
  open,
  totalQuestions,
  onClose,
  onPick,
}: {
  open: boolean;
  totalQuestions: number;
  onClose: () => void;
  onPick: (mode: "50" | "all") => void;
}) {
  if (!open) return null;

  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-lg rounded-3xl border border-fog/70 bg-white p-5 shadow-xl">
        <div className="text-lg font-semibold text-cocoa">Daudz jautājumu</div>

        <p className="mt-2 text-sm text-cocoa/70">
          Šai tēmai ir <b>{totalQuestions}</b> jautājumi. Vai vēlies trenēties ar{" "}
          <b>50 nejaušiem</b> jautājumiem vai ar <b>visiem</b>?
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onPick("50")}
            className="rounded-2xl bg-[#3F2021] px-5 py-3 text-sm font-semibold text-white transition hover:cursor-pointer hover:scale-102"
          >
            50 nejauši
          </button>

          <button
            type="button"
            onClick={() => onPick("all")}
            className="rounded-2xl border border-fog px-5 py-3 text-sm font-semibold text-cocoa transition hover:cursor-pointer hover:scale-102"
          >
            Visi jautājumi
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate("/");
          }}
          className="mt-4 w-full rounded-2xl px-5 py-3 text-sm font-semibold text-cocoa/70 hover:bg-fog/30 border hover:cursor-pointer hover:underline"
        >
          Atgriezties sākumā
        </button>
      </div>
    </div>
  );
}
