import Turnstile from "react-turnstile";

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
};

export default function CaptchaTurnstile({
  siteKey,
  onToken,
  onExpire,
  onError,
}: Props) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-4">
      <Turnstile
        sitekey={siteKey}
        onVerify={(token) => onToken(token)}
        onExpire={() => onExpire?.()}
        onError={() => onError?.()}
        theme="light"
      />
      <p className="mt-2 text-xs text-cocoa/60">
        Aizsardzība pret ļaunprātīgiem pieprasījumiem .
      </p>
    </div>
  );
}
