// Calendar-date helpers for bookings. Dates are plain "YYYY-MM-DD" strings in
// Abuja time; all arithmetic happens in UTC so no time zone can shift a day.
// Safe to import from both server and client code.

const DAY_MS = 24 * 60 * 60 * 1000;

const toUtc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;

export const addDays = (iso: string, days: number) => fromUtc(toUtc(iso) + days * DAY_MS);

export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.round((toUtc(checkOut) - toUtc(checkIn)) / DAY_MS);

/** Each night of a stay: from check-in up to, but not including, check-out. */
export function eachNight(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) nights.push(d);
  return nights;
}

const abujaDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' });

/** Today's date in Abuja (Africa/Lagos, UTC+1). */
export const todayInAbuja = () => abujaDay.format(new Date());

/** Written to Payload date fields at midday UTC, so the calendar day never drifts. */
export const toStoredDate = (iso: string) => `${iso}T12:00:00.000Z`;

/** The Abuja calendar day of any stored timestamp (admin date pickers may store local midnight). */
export const fromStoredDate = (stored: string) => abujaDay.format(new Date(stored));

const longFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "Sat, 1 Nov 2026" */
export const formatDate = (iso: string) => longFormat.format(new Date(toUtc(iso)));

export const formatNaira = (amount: number) => `₦${new Intl.NumberFormat('en-NG').format(amount)}`;
