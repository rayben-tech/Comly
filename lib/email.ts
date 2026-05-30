import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "Comly <hello@trycomly.com>";
const DASHBOARD_URL = "https://www.trycomly.com/audit";
const UPGRADE_URL = "https://www.trycomly.com/#pricing";

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:20px;font-weight:900;color:#5B2D91;letter-spacing:-0.5px;">Comly</span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:16px;padding:36px 40px;border:1px solid #e8e8e8;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:24px;text-align:center;color:#aaaaaa;font-size:12px;line-height:1.6;">
          You're receiving this because you have an active Comly account.<br>
          <a href="${UPGRADE_URL}" style="color:#aaaaaa;">Manage subscription</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;background:#5B2D91;color:#ffffff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:100px;text-decoration:none;margin-top:28px;">${text} →</a>`;
}

function scoreColor(score: number) {
  return score >= 60 ? "#10b981" : score >= 30 ? "#f59e0b" : "#ef4444";
}

// ─── 1. Welcome email ────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, brandName: string, score: number) {
  if (!resend) return;
  const color = scoreColor(score);
  const grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0a0a0a;">Your audit is ready 🎯</h1>
    <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
      Here's how <strong>${brandName}</strong> shows up in AI answers right now.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ff;border-radius:12px;padding:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">AI Visibility Score</p>
          <p style="margin:0;font-size:52px;font-weight:900;line-height:1;color:${color};">${score}<span style="font-size:22px;color:#d1d5db;">/100</span></p>
          <p style="margin:6px 0 0;font-size:13px;font-weight:600;color:${color};">Grade ${grade}</p>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;color:#374151;font-size:15px;line-height:1.7;">
      Your score tells you how often AI tools like ChatGPT, Claude, and Gemini mention your brand when people ask questions in your space.<br><br>
      Head to your dashboard to see which prompts mention you, who your competitors are, and exactly what to fix first.
    </p>

    ${ctaButton("View your dashboard", DASHBOARD_URL)}
  `);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your AI Visibility Score is ready — ${score}/100`,
    html,
  }).catch((e) => console.error("sendWelcomeEmail failed:", e));
}

// ─── 2. Daily score email ─────────────────────────────────────────────────────

export async function sendDailyScoreEmail(
  to: string,
  brandName: string,
  score: number,
  prevScore: number | null
) {
  if (!resend) return;
  const color = scoreColor(score);
  const diff = prevScore !== null ? score - prevScore : null;
  const diffText =
    diff === null ? "" :
    diff > 0 ? `<span style="color:#10b981;font-weight:700;">▲ +${diff} pts from yesterday</span>` :
    diff < 0 ? `<span style="color:#ef4444;font-weight:700;">▼ ${diff} pts from yesterday</span>` :
    `<span style="color:#9ca3af;font-weight:600;">— Same as yesterday</span>`;

  const subject =
    diff === null ? `Your daily AI score: ${score}/100 — ${brandName}` :
    diff > 0 ? `↑ Your score went up ${diff} pts today — ${brandName}` :
    diff < 0 ? `↓ Your score dropped ${Math.abs(diff)} pts today — ${brandName}` :
    `Your daily AI score: ${score}/100 — ${brandName}`;

  const html = baseTemplate(`
    <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0a0a0a;">Daily AI Visibility Report</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">${brandName}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ff;border-radius:12px;padding:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Today's Score</p>
          <p style="margin:0;font-size:52px;font-weight:900;line-height:1;color:${color};">${score}<span style="font-size:22px;color:#d1d5db;">/100</span></p>
          ${diffText ? `<p style="margin:8px 0 0;font-size:13px;">${diffText}</p>` : ""}
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;color:#374151;font-size:15px;line-height:1.7;">
      Your audit just ran automatically. Open your dashboard to see which AI models are mentioning you today and what's changed.
    </p>

    ${ctaButton("See full report", DASHBOARD_URL)}
  `);

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  }).catch((e) => console.error("sendDailyScoreEmail failed:", e));
}

// ─── 3. Trial expiry warning (1 day left) ─────────────────────────────────────

export async function sendExpiryWarningEmail(to: string, brandName: string) {
  if (!resend) return;

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0a0a0a;">Your trial ends tomorrow ⏰</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      You have <strong>1 day left</strong> on your Comly trial for <strong>${brandName}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8;border-radius:12px;padding:20px;">
      <tr><td>
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0a0a0a;">What you'll lose when the trial ends:</p>
        <p style="margin:0 0 8px;font-size:14px;color:#374151;">❌ &nbsp;Daily AI audits running automatically</p>
        <p style="margin:0 0 8px;font-size:14px;color:#374151;">❌ &nbsp;Score tracking over time</p>
        <p style="margin:0 0 8px;font-size:14px;color:#374151;">❌ &nbsp;Access to your dashboard and results</p>
        <p style="margin:0;font-size:14px;color:#374151;">❌ &nbsp;Reddit, Quora, and content fix tools</p>
      </td></tr>
    </table>

    <p style="margin:24px 0 0;color:#374151;font-size:15px;line-height:1.7;">
      Upgrade now for <strong>$49/mo</strong> to keep everything running without interruption.
    </p>

    ${ctaButton("Upgrade now — $49/mo", UPGRADE_URL)}

    <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;">No commitment. Cancel anytime.</p>
  `);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Comly trial ends tomorrow — ${brandName}`,
    html,
  }).catch((e) => console.error("sendExpiryWarningEmail failed:", e));
}

// ─── 4. Trial expired ─────────────────────────────────────────────────────────

export async function sendTrialExpiredEmail(to: string, brandName: string, lastScore: number) {
  if (!resend) return;
  const color = scoreColor(lastScore);

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0a0a0a;">Your trial has ended</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Your 3-day Comly trial for <strong>${brandName}</strong> is over.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ff;border-radius:12px;padding:20px 24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Last recorded score</p>
          <p style="margin:0;font-size:40px;font-weight:900;line-height:1;color:${color};">${lastScore}<span style="font-size:18px;color:#d1d5db;">/100</span></p>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;color:#374151;font-size:15px;line-height:1.7;">
      Your daily audits have paused. Upgrade to <strong>$49/mo</strong> to keep tracking your AI visibility and see how your score moves every day.
    </p>

    ${ctaButton("Continue with Comly", UPGRADE_URL)}

    <p style="margin:16px 0 0;color:#9ca3af;font-size:13px;">No commitment. Cancel anytime.</p>
  `);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Comly trial ended — pick up where you left off`,
    html,
  }).catch((e) => console.error("sendTrialExpiredEmail failed:", e));
}
