import 'server-only';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { CONTACT, SITE_URL } from './seo';
import { detailRows, emailLayout, escapeHtml, sendEmail } from './email';

// Emails sent when someone submits the concierge/enquiry form:
// an acknowledgement to them, and an alert to the team.

/** Public contact address: guest replies go here (hello@ is for internal use). */
const PUBLIC_REPLY_TO = 'novarenlifestyle@yahoo.com';

const teamAddresses = () =>
  (process.env.INQUIRY_NOTIFY_EMAILS || 'novarenlifestyle@yahoo.com,hello@novarenlifestyle.cc')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

/** Send at most one acknowledgement per address in this window, so the form can't be used to spam people. */
const ACK_WINDOW_MINUTES = 15;

const TYPE_LABELS: Record<string, string> = {
  'curated-stay': 'Curated stay (shortlet)',
  'prestige-mobility': 'Car hire / transport',
  'the-abuja-access': 'Concierge request',
  'brand-partnership': 'Brand partnership',
  'general-inquiry': 'General enquiry',
};

export type InquiryDoc = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  inquiryType: string;
  message: string;
  createdAt?: string;
};

export async function sendInquiryEmails(doc: InquiryDoc) {
  const type = TYPE_LABELS[doc.inquiryType] ?? doc.inquiryType;
  const fullName = `${doc.firstName} ${doc.lastName === '-' ? '' : doc.lastName}`.trim();

  // Team alert: full details. Reply goes straight to the person who enquired.
  const team = sendEmail({
    to: teamAddresses(),
    replyTo: doc.email,
    subject: `New enquiry: ${type} from ${fullName}`,
    html: emailLayout(
      'New enquiry from the website',
      `${detailRows([
        ['Name', escapeHtml(fullName)],
        ['Email', escapeHtml(doc.email)],
        ['Request', escapeHtml(type)],
        ['Received', new Date(doc.createdAt ?? Date.now()).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })],
      ])}
<p style="font-size:13px;color:#6c746d;margin:0 0 6px">Message</p>
<div style="font-size:14px;line-height:1.6;white-space:pre-line;background:#f7f4ec;padding:14px 16px;margin:0 0 18px">${escapeHtml(doc.message)}</div>
<p style="font-size:14px">Reply to this email to answer ${escapeHtml(doc.firstName)} directly, or
<a href="${SITE_URL}/admin/collections/inquiries/${doc.id}" style="color:#173e32">open it in the admin panel →</a></p>`,
    ),
  });

  // Acknowledgement: fixed wording only (plus a shortened first name), never the message itself.
  const ack = (async () => {
    if (!(await isFirstRecentInquiry(doc))) return false;
    const firstName = escapeHtml(doc.firstName.trim().slice(0, 40));
    return sendEmail({
      to: doc.email,
      replyTo: PUBLIC_REPLY_TO,
      subject: 'We’ve received your request · Novaren Lifestyle',
      html: emailLayout(
        `Thank you, ${firstName}.`,
        `<p style="font-size:14px;line-height:1.6;margin:0 0 14px">We’ve received your ${escapeHtml(type.toLowerCase())} and a member of our team will review it and get back to you shortly.</p>
<p style="font-size:14px;line-height:1.6;margin:0 0 14px">Every request is checked for availability, feasibility and cost before we confirm anything, so there’s nothing more you need to do for now.</p>
<p style="font-size:14px;line-height:1.6;margin:0">Need us sooner? Message us on WhatsApp: <a href="${CONTACT.whatsapp}" style="color:#173e32">${CONTACT.phoneDisplay}</a>, or simply reply to this email.</p>`,
      ),
    });
  })();

  const [teamResult, ackResult] = await Promise.allSettled([team, ack]);
  for (const r of [teamResult, ackResult]) {
    if (r.status === 'rejected') console.error('[inquiry-emails] send failed', r.reason);
  }
}

/** True unless this address already submitted an enquiry within the acknowledgement window. */
async function isFirstRecentInquiry(doc: InquiryDoc) {
  try {
    const payload = await getPayload({ config: configPromise });
    const since = new Date(Date.now() - ACK_WINDOW_MINUTES * 60_000).toISOString();
    const recent = await payload.count({
      collection: 'inquiries',
      where: { and: [{ email: { equals: doc.email } }, { createdAt: { greater_than: since } }] },
    });
    return recent.totalDocs <= 1;
  } catch {
    return true;
  }
}
