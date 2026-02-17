import { Resend } from "resend";

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("Missing TURNSTILE_SECRET_KEY");

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });

  return await resp.json();
}

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#039;";
      default: return m;
    }
  });
}

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { status: 405 });
    }

    const payload = await req.json();

    const captchaToken = payload?.captchaToken;
    const form = payload?.form;

    if (!captchaToken) return new Response(JSON.stringify({ ok: false, error: "Missing captchaToken" }), { status: 400 });
    if (!form?.email) return new Response(JSON.stringify({ ok: false, error: "Missing email" }), { status: 400 });
    if (!form?.courseId) return new Response(JSON.stringify({ ok: false, error: "Missing courseId" }), { status: 400 });

    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") ||
      null;

    // 1) verify captcha server-side
    const cap = await verifyTurnstile(captchaToken, ip);
    if (!cap?.success) {
      return new Response(JSON.stringify({ ok: false, error: "Captcha failed", details: cap["error-codes"] }), {
        status: 400,
      });
    }

    // 2) send email
    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.APPLICATION_TO_EMAIL;
    const fromEmail = process.env.APPLICATION_FROM_EMAIL;

    if (!resendKey || !toEmail || !fromEmail) {
      return new Response(JSON.stringify({ ok: false, error: "Missing env vars" }), { status: 500 });
    }

    const resend = new Resend(resendKey);

    const subject = `Jauns pieteikums: ${esc(form.firstName)} ${esc(form.lastName)} (${esc(form.courseId)})`;

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.55">
        <h2>Jauns pieteikums</h2>
        <p><b>Pakalpojums (ID):</b> ${esc(form.courseId)}</p>
        <p><b>Vārds:</b> ${esc(form.firstName)} ${esc(form.lastName)}</p>
        <p><b>E-pasts:</b> ${esc(form.email)}</p>
        <p><b>Tālrunis:</b> ${esc(form.phone)}</p>
        <p><b>Pilsēta:</b> ${esc(form.city)}</p>
        <p><b>Pieejamība:</b> ${esc(form.availability)}</p>
        <p><b>Papildu informācija:</b><br/>${esc(form.notes).replace(/\n/g, "<br/>")}</p>
        <p><b>Kur uzzināja:</b><br/>${esc(form.referral).replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p style="color:#666;font-size:12px">Nosūtīts no pieteikšanās formas.</p>
      </div>
    `;

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: form.email,
      subject,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Server error" }), { status: 500 });
  }
};
