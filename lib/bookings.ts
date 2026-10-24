import 'server-only';
import crypto from 'node:crypto';
import { getPayload, type Payload } from 'payload';
import configPromise from '@payload-config';
import {
  addDays,
  eachNight,
  formatDate,
  formatNaira,
  fromStoredDate,
  isIsoDate,
  nightsBetween,
  todayInAbuja,
  toStoredDate,
} from './dates';
import { initializeTransaction, paystackConfigured, verifyTransaction } from './paystack';
import { bookingsNotifyAddress, detailRows, emailLayout, escapeHtml, sendEmail } from './email';
import { CONTACT, SITE_URL } from './seo';

/** Unpaid bookings hold their dates this long, so two guests can't pay for the same nights. */
const PENDING_HOLD_MINUTES = 30;
const MAX_NIGHTS = 90;
const BOOKING_WINDOW_DAYS = 365;

// ---------- Apartments ----------

export type Apartment = {
  id: string;
  slug: string;
  name: string;
  area: string;
  summary: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  nightlyRate: number;
  cautionDeposit: number;
  minNights: number;
  checkInTime: string;
  checkOutTime: string;
  photos: { url: string; alt: string }[];
  amenities: string[];
  houseRules: string[];
  published: boolean;
};

type ApartmentDoc = {
  id: number | string;
  slug: string;
  name: string;
  area: string;
  summary: string;
  description: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxGuests: number;
  nightlyRate: number;
  cautionDeposit?: number | null;
  minNights?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  gallery?: { image?: { url?: string | null; alt?: string | null } | number | null }[] | null;
  amenities?: { item: string }[] | null;
  houseRules?: { item: string }[] | null;
  blockedDates?: { from: string; to: string }[] | null;
  arrivalInstructions?: string | null;
  published?: boolean | null;
};

function mapApartment(doc: ApartmentDoc): Apartment {
  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    area: doc.area,
    summary: doc.summary,
    description: doc.description,
    bedrooms: doc.bedrooms ?? 0,
    bathrooms: doc.bathrooms ?? 0,
    maxGuests: doc.maxGuests,
    nightlyRate: doc.nightlyRate,
    cautionDeposit: doc.cautionDeposit ?? 0,
    minNights: Math.max(1, doc.minNights ?? 1),
    checkInTime: doc.checkInTime || '2:00 pm',
    checkOutTime: doc.checkOutTime || '12:00 pm',
    photos: (doc.gallery ?? []).flatMap((g) =>
      typeof g.image === 'object' && g.image?.url ? [{ url: g.image.url, alt: g.image.alt || doc.name }] : [],
    ),
    amenities: (doc.amenities ?? []).map((a) => a.item),
    houseRules: (doc.houseRules ?? []).map((r) => r.item),
    published: Boolean(doc.published),
  };
}

const payloadClient = () => getPayload({ config: configPromise });

/** Published apartments for the /stays listing. Empty if none exist or the CMS is unreachable. */
export async function getPublishedApartments(): Promise<Apartment[]> {
  try {
    const payload = await payloadClient();
    const res = await payload.find({
      collection: 'apartments',
      where: { published: { equals: true } },
      sort: 'sortOrder',
      limit: 50,
      depth: 1,
    });
    return (res.docs as unknown as ApartmentDoc[]).map(mapApartment);
  } catch (error) {
    console.error('Failed to load apartments', error);
    return [];
  }
}

async function findApartmentDoc(payload: Payload, where: { slug?: string; id?: string }) {
  const res = await payload.find({
    collection: 'apartments',
    where: where.slug ? { slug: { equals: where.slug } } : { id: { equals: where.id } },
    limit: 1,
    depth: 1,
  });
  return (res.docs[0] as unknown as ApartmentDoc | undefined) ?? null;
}

/** An apartment by slug. Unpublished listings are only returned for logged-in admins (preview). */
export async function getApartmentBySlug(slug: string, isAdmin: boolean): Promise<Apartment | null> {
  const payload = await payloadClient();
  const doc = await findApartmentDoc(payload, { slug });
  if (!doc || (!doc.published && !isAdmin)) return null;
  return mapApartment(doc);
}

// ---------- Availability ----------

/** Nights (YYYY-MM-DD) that can't be booked: paid bookings, fresh holds and blocked periods. */
async function takenNights(payload: Payload, apartment: ApartmentDoc, excludeBookingId?: string) {
  const today = todayInAbuja();
  const holdCutoff = new Date(Date.now() - PENDING_HOLD_MINUTES * 60_000).toISOString();
  const res = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { apartment: { equals: apartment.id } },
        { checkOut: { greater_than: toStoredDate(today) } },
        {
          or: [
            { status: { equals: 'confirmed' } },
            { and: [{ status: { equals: 'pending' } }, { createdAt: { greater_than: holdCutoff } }] },
          ],
        },
      ],
    },
    limit: 1000,
    depth: 0,
  });

  const taken = new Set<string>();
  for (const b of res.docs as unknown as { id: number | string; checkIn: string; checkOut: string }[]) {
    if (excludeBookingId && String(b.id) === excludeBookingId) continue;
    eachNight(fromStoredDate(b.checkIn), fromStoredDate(b.checkOut)).forEach((n) => taken.add(n));
  }
  for (const block of apartment.blockedDates ?? []) {
    const from = fromStoredDate(block.from);
    const to = fromStoredDate(block.to);
    if (to >= from) eachNight(from, addDays(to, 1)).forEach((n) => taken.add(n));
  }
  return taken;
}

/** Unavailable nights for the booking calendar, today onwards. */
export async function getUnavailableNights(apartmentId: string): Promise<string[]> {
  const payload = await payloadClient();
  const doc = await findApartmentDoc(payload, { id: apartmentId });
  if (!doc) return [];
  const today = todayInAbuja();
  const horizon = addDays(today, BOOKING_WINDOW_DAYS);
  return [...(await takenNights(payload, doc))].filter((n) => n >= today && n <= horizon).sort();
}

// ---------- Quotes ----------

export type Quote = { nights: number; nightlyRate: number; staySubtotal: number; cautionDeposit: number; total: number };

export function quoteStay(
  apartment: Pick<Apartment, 'nightlyRate' | 'cautionDeposit' | 'minNights' | 'maxGuests'>,
  checkIn: string,
  checkOut: string,
  guests: number,
): { ok: true; quote: Quote } | { ok: false; error: string } {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return { ok: false, error: 'Please choose your dates.' };
  const today = todayInAbuja();
  if (checkIn < today) return { ok: false, error: 'Check-in can’t be in the past.' };
  if (checkIn > addDays(today, BOOKING_WINDOW_DAYS)) return { ok: false, error: 'Bookings open up to a year ahead.' };
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { ok: false, error: 'Check-out must be after check-in.' };
  if (nights < apartment.minNights) return { ok: false, error: `This apartment has a ${apartment.minNights}-night minimum.` };
  if (nights > MAX_NIGHTS) return { ok: false, error: `For stays over ${MAX_NIGHTS} nights, please contact us directly.` };
  if (!Number.isInteger(guests) || guests < 1 || guests > apartment.maxGuests) {
    return { ok: false, error: `This apartment sleeps up to ${apartment.maxGuests}.` };
  }
  const staySubtotal = apartment.nightlyRate * nights;
  return {
    ok: true,
    quote: {
      nights,
      nightlyRate: apartment.nightlyRate,
      staySubtotal,
      cautionDeposit: apartment.cautionDeposit,
      total: staySubtotal + apartment.cautionDeposit,
    },
  };
}

// ---------- Starting a booking ----------

export type BookingRequest = {
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const newReference = () => `NVR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

function validateGuest(input: BookingRequest): string | null {
  const name = input.name?.trim() ?? '';
  if (name.length < 2 || name.length > 100) return 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email?.trim() ?? '')) return 'Please enter a valid email address.';
  if (!/^\+?[\d\s()-]{7,20}$/.test(input.phone?.trim() ?? '')) return 'Please enter a valid phone number.';
  if ((input.notes ?? '').length > 1000) return 'Notes are limited to 1,000 characters.';
  return null;
}

/**
 * Re-prices and re-checks availability on the server, records a pending
 * booking (holding the dates) and returns the Paystack checkout URL.
 */
export async function startBooking(
  input: BookingRequest,
  ctx: { isAdmin: boolean; callbackUrl: string },
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const unavailable = `Online booking is unavailable right now. Please message us on WhatsApp (${CONTACT.phoneDisplay}).`;
  if (!paystackConfigured()) {
    console.error('[bookings] PAYSTACK_SECRET_KEY is not set.');
    return { ok: false, error: unavailable };
  }
  const guestError = validateGuest(input);
  if (guestError) return { ok: false, error: guestError };

  const payload = await payloadClient();
  const doc = await findApartmentDoc(payload, { id: String(input.apartmentId) });
  if (!doc || (!doc.published && !ctx.isAdmin)) return { ok: false, error: 'This apartment is no longer available.' };

  const priced = quoteStay(mapApartment(doc), input.checkIn, input.checkOut, Number(input.guests));
  if (!priced.ok) return priced;

  const taken = await takenNights(payload, doc);
  if (eachNight(input.checkIn, input.checkOut).some((n) => taken.has(n))) {
    return { ok: false, error: 'Some of those nights were just booked. Please choose other dates.' };
  }

  const reference = newReference();
  const { quote } = priced;
  const booking = await payload.create({
    collection: 'bookings',
    data: {
      reference,
      status: 'pending',
      apartment: doc.id,
      checkIn: toStoredDate(input.checkIn),
      checkOut: toStoredDate(input.checkOut),
      nights: quote.nights,
      guests: Number(input.guests),
      guestName: input.name.trim(),
      guestEmail: input.email.trim().toLowerCase(),
      guestPhone: input.phone.trim(),
      notes: input.notes?.trim() || undefined,
      nightlyRate: quote.nightlyRate,
      staySubtotal: quote.staySubtotal,
      cautionDeposit: quote.cautionDeposit,
      total: quote.total,
    } as never,
  });

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: input.email.trim(),
      amountNaira: quote.total,
      reference,
      callbackUrl: ctx.callbackUrl,
      metadata: {
        booking: reference,
        apartment: doc.name,
        check_in: input.checkIn,
        check_out: input.checkOut,
        custom_fields: [
          { display_name: 'Apartment', variable_name: 'apartment', value: doc.name },
          { display_name: 'Dates', variable_name: 'dates', value: `${input.checkIn} to ${input.checkOut}` },
        ],
      },
    });
    return { ok: true, url: authorizationUrl };
  } catch (error) {
    console.error('[bookings] Paystack initialize failed', error);
    await payload.update({ collection: 'bookings', id: booking.id, data: { status: 'failed' } as never });
    return { ok: false, error: unavailable };
  }
}

// ---------- Confirming a payment ----------

export type BookingSummary = {
  reference: string;
  status: 'pending' | 'confirmed' | 'needs-refund' | 'cancelled' | 'failed';
  apartmentName: string;
  apartmentSlug: string;
  area: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  guests: number;
  guestFirstName: string;
  guestEmailMasked: string;
  staySubtotal: number;
  cautionDeposit: number;
  total: number;
};

type BookingDoc = {
  id: number | string;
  reference: string;
  status: BookingSummary['status'];
  apartment: ApartmentDoc | number | string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string | null;
  nightlyRate: number;
  staySubtotal: number;
  cautionDeposit: number;
  total: number;
  emailsSentAt?: string | null;
};

const maskEmail = (email: string) => {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 1)}${'•'.repeat(Math.max(2, Math.min(user.length - 1, 6)))}@${domain}`;
};

function summarise(b: BookingDoc, apt: ApartmentDoc): BookingSummary {
  return {
    reference: b.reference,
    status: b.status,
    apartmentName: apt.name,
    apartmentSlug: apt.slug,
    area: apt.area,
    checkIn: fromStoredDate(b.checkIn),
    checkOut: fromStoredDate(b.checkOut),
    checkInTime: apt.checkInTime || '2:00 pm',
    checkOutTime: apt.checkOutTime || '12:00 pm',
    nights: b.nights,
    guests: b.guests,
    guestFirstName: b.guestName.split(/\s+/)[0],
    guestEmailMasked: maskEmail(b.guestEmail),
    staySubtotal: b.staySubtotal,
    cautionDeposit: b.cautionDeposit,
    total: b.total,
  };
}

/**
 * Verifies a payment with Paystack and confirms the booking. Safe to call more
 * than once (the callback page and the webhook both call it); emails go out once.
 */
export async function confirmBooking(reference: string): Promise<BookingSummary | null> {
  if (!/^NVR-[A-F0-9]{8}$/.test(reference)) return null;
  const payload = await payloadClient();
  const found = await payload.find({
    collection: 'bookings',
    where: { reference: { equals: reference } },
    limit: 1,
    depth: 1,
  });
  let booking = found.docs[0] as unknown as BookingDoc | undefined;
  if (!booking || typeof booking.apartment !== 'object') return null;
  const apartment = booking.apartment as ApartmentDoc;

  if (booking.status === 'pending' || booking.status === 'failed') {
    const tx = await verifyTransaction(reference);
    if (tx?.status === 'success' && tx.currency === 'NGN' && tx.amountNaira >= booking.total) {
      // Another guest may have paid for these nights after this booking's hold expired.
      const taken = await takenNights(payload, apartment, String(booking.id));
      const clash = eachNight(fromStoredDate(booking.checkIn), fromStoredDate(booking.checkOut)).some((n) =>
        taken.has(n),
      );
      booking = (await payload.update({
        collection: 'bookings',
        id: booking.id,
        depth: 1,
        data: {
          status: clash ? 'needs-refund' : 'confirmed',
          paidAt: tx.paidAt ?? new Date().toISOString(),
          paystackTransactionId: tx.transactionId,
          paymentChannel: tx.channel,
        } as never,
      })) as unknown as BookingDoc;
    } else if (tx && ['failed', 'abandoned', 'reversed'].includes(tx.status) && booking.status === 'pending') {
      booking = (await payload.update({
        collection: 'bookings',
        id: booking.id,
        depth: 1,
        data: { status: 'failed' } as never,
      })) as unknown as BookingDoc;
    }
  }

  if ((booking.status === 'confirmed' || booking.status === 'needs-refund') && !booking.emailsSentAt) {
    // Claim the send first so the webhook and the redirect don't both email.
    const claimed = await payload.update({
      collection: 'bookings',
      where: { and: [{ id: { equals: booking.id } }, { emailsSentAt: { exists: false } }] },
      data: { emailsSentAt: new Date().toISOString() } as never,
    });
    if (claimed.docs.length === 1) await sendBookingEmails(booking, apartment);
  }

  return summarise(booking, apartment);
}

// ---------- Emails ----------

async function sendBookingEmails(b: BookingDoc, apt: ApartmentDoc) {
  const rows: [string, string][] = [
    ['Reference', b.reference],
    ['Apartment', `${escapeHtml(apt.name)}, ${escapeHtml(apt.area)}`],
    ['Check-in', `${formatDate(fromStoredDate(b.checkIn))}, from ${escapeHtml(apt.checkInTime || '2:00 pm')}`],
    ['Check-out', `${formatDate(fromStoredDate(b.checkOut))}, by ${escapeHtml(apt.checkOutTime || '12:00 pm')}`],
    ['Nights · guests', `${b.nights} · ${b.guests}`],
    ['Stay', formatNaira(b.staySubtotal)],
    ...(b.cautionDeposit > 0 ? ([['Caution deposit (refundable)', formatNaira(b.cautionDeposit)]] as [string, string][]) : []),
    ['Total paid', formatNaira(b.total)],
  ];
  const firstName = escapeHtml(b.guestName.split(/\s+/)[0]);

  if (b.status === 'confirmed') {
    const arrival = apt.arrivalInstructions?.trim()
      ? `<h2 style="font-family:Georgia,serif;font-weight:normal;font-size:19px;color:#173e32;margin:22px 0 8px">Arrival details</h2>
<p style="font-size:14px;line-height:1.6;white-space:pre-line;margin:0 0 18px">${escapeHtml(apt.arrivalInstructions)}</p>`
      : `<p style="font-size:14px;line-height:1.6">We'll send the exact address and arrival details before your check-in.</p>`;
    await sendEmail({
      to: b.guestEmail,
      replyTo: bookingsNotifyAddress(),
      subject: `Your stay is confirmed · ${apt.name} · ${b.reference}`,
      html: emailLayout(
        `You're booked, ${firstName}.`,
        `<p style="font-size:14px;line-height:1.6;margin:0 0 18px">Thank you for booking with Novaren. Your payment was received and your dates are reserved.</p>
${detailRows(rows)}
${b.cautionDeposit > 0 ? '<p style="font-size:13px;line-height:1.6;color:#6c746d">The caution deposit is refunded after check-out, once the apartment has been checked.</p>' : ''}
${arrival}
<p style="font-size:14px;line-height:1.6">Need anything before you arrive? Reply to this email or message us on WhatsApp: <a href="${CONTACT.whatsapp}" style="color:#173e32">${CONTACT.phoneDisplay}</a>.</p>`,
      ),
    });
  }

  const adminUrl = `${SITE_URL}/admin/collections/bookings/${b.id}`;
  const clash = b.status === 'needs-refund';
  await sendEmail({
    to: bookingsNotifyAddress(),
    replyTo: b.guestEmail,
    subject: clash
      ? `ACTION NEEDED: paid booking clashes with existing dates · ${b.reference}`
      : `New booking: ${apt.name}, ${fromStoredDate(b.checkIn)} → ${fromStoredDate(b.checkOut)} · ${b.reference}`,
    html: emailLayout(
      clash ? 'Paid booking needs a refund or a move' : 'New shortlet booking',
      `${clash ? '<p style="font-size:14px;line-height:1.6;color:#8a2a20"><strong>This guest paid, but the nights were taken by another booking while their payment was in progress.</strong> Please contact them to move the dates or refund via Paystack.</p>' : ''}
${detailRows([
  ...rows,
  ['Guest', escapeHtml(b.guestName)],
  ['Email', escapeHtml(b.guestEmail)],
  ['Phone', escapeHtml(b.guestPhone)],
  ...(b.notes ? ([['Notes', escapeHtml(b.notes)]] as [string, string][]) : []),
])}
<p style="font-size:14px"><a href="${adminUrl}" style="color:#173e32">Open in the admin panel →</a></p>`,
    ),
  });
}
