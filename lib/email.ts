import 'server-only';
import { CONTACT, SITE_NAME } from './seo';

// Sends transactional email through Resend's REST API (https://resend.com/docs/api-reference).
// The sender must be on a domain verified in Resend; until then Resend only
// delivers from onboarding@resend.dev to the account owner's own address.

const FALLBACK_NOTIFY = 'hello@novarenlifestyle.cc';

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.BOOKINGS_EMAIL_FROM);

export const bookingsNotifyAddress = () => process.env.BOOKINGS_NOTIFY_EMAIL || FALLBACK_NOTIFY;

export async function sendEmail(input: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  if (!emailConfigured()) {
    console.warn(`[email] Skipped "${input.subject}": RESEND_API_KEY or BOOKINGS_EMAIL_FROM is not set.`);
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.BOOKINGS_EMAIL_FROM,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error(`[email] Resend rejected "${input.subject}" (${res.status}): ${await res.text().catch(() => '')}`);
    return false;
  }
  return true;
}

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Branded wrapper. Inline styles only: most email clients ignore <style>. */
export function emailLayout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f7f4ec;font-family:Arial,Helvetica,sans-serif;color:#1f2924">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ec;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffefa;border:1px solid #e8e3d8">
<tr><td style="background:#173e32;padding:22px 28px;color:#fff;font-family:Georgia,serif;font-size:22px;letter-spacing:2px">NOVAREN
<div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;color:#d5bd87;margin-top:4px">LIFESTYLE &amp; CONCIERGE</div></td></tr>
<tr><td style="padding:28px">
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:26px;color:#173e32;margin:0 0 16px">${title}</h1>
${body}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #e8e3d8;font-size:12px;color:#6c746d">
${SITE_NAME} · Abuja, Nigeria · WhatsApp / phone ${CONTACT.phoneDisplay}</td></tr>
</table></td></tr></table></body></html>`;
}

/** Two-column detail rows, e.g. [["Check-in", "Sat, 1 Nov 2026"], …] */
export function detailRows(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:0 0 18px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#6c746d;width:42%">${k}</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:bold">${v}</td></tr>`,
    )
    .join('')}</table>`;
}
