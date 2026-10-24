import type { Metadata } from "next";
import Link from "next/link";
import { confirmBooking } from "@/lib/bookings";
import { formatDate, formatNaira } from "@/lib/dates";
import { CONTACT } from "@/lib/seo";
import TrackEvent from "../../_components/TrackEvent";

export const metadata: Metadata = {
  title: "Booking confirmation",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ reference?: string; trxref?: string }> };

// Paystack redirects here with ?reference=…; we verify the payment server-side before showing anything.
export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const reference = (params.reference ?? params.trxref ?? "").trim();
  const booking = reference ? await confirmBooking(reference) : null;

  if (!booking) {
    return (
      <section className="confirm container">
        <div className="eyebrow">Booking</div>
        <h1>We couldn&apos;t find that booking.</h1>
        <p>If you were charged, don&apos;t worry: message us with your payment receipt and we&apos;ll sort it out.</p>
        <div className="actions">
          <a className="btn" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" data-umami-event="WhatsApp click" data-umami-event-location="booking confirmation">
            Message us on WhatsApp
          </a>
          <Link className="btn light" href="/stays">
            Browse stays
          </Link>
        </div>
      </section>
    );
  }

  const details = (
    <dl className="confirm-details">
      <div>
        <dt>Reference</dt>
        <dd>{booking.reference}</dd>
      </div>
      <div>
        <dt>Apartment</dt>
        <dd>
          {booking.apartmentName}, {booking.area}
        </dd>
      </div>
      <div>
        <dt>Check-in</dt>
        <dd>
          {formatDate(booking.checkIn)}, from {booking.checkInTime}
        </dd>
      </div>
      <div>
        <dt>Check-out</dt>
        <dd>
          {formatDate(booking.checkOut)}, by {booking.checkOutTime}
        </dd>
      </div>
      <div>
        <dt>Nights · guests</dt>
        <dd>
          {booking.nights} · {booking.guests}
        </dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>
          {formatNaira(booking.total)}
          {booking.cautionDeposit > 0 && <small> incl. {formatNaira(booking.cautionDeposit)} refundable deposit</small>}
        </dd>
      </div>
    </dl>
  );

  if (booking.status === "confirmed") {
    return (
      <section className="confirm container">
        <TrackEvent
          name="Booking confirmed"
          data={{ apartment: booking.apartmentName, nights: booking.nights, total: booking.total }}
          onceKey={`nv-booked-${booking.reference}`}
        />
        <div className="confirm-badge" aria-hidden="true">
          ✓
        </div>
        <div className="eyebrow">Payment received</div>
        <h1>You&apos;re booked, {booking.guestFirstName}.</h1>
        <p>
          We&apos;ve sent your confirmation to <strong>{booking.guestEmailMasked}</strong>. The exact address and
          arrival details are in that email.
        </p>
        {details}
        <div className="actions">
          <a className="btn" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" data-umami-event="WhatsApp click" data-umami-event-location="booking confirmation">
            Questions? WhatsApp us
          </a>
          <Link className="btn light" href="/">
            Back to Novaren
          </Link>
        </div>
      </section>
    );
  }

  if (booking.status === "needs-refund") {
    return (
      <section className="confirm container">
        <div className="eyebrow">Payment received</div>
        <h1>We&apos;re sorry, those dates were just taken.</h1>
        <p>
          Your payment came through, but another guest booked the same nights while you were paying. Our team has
          been alerted and will contact you shortly to move your dates or refund you in full.
        </p>
        {details}
        <div className="actions">
          <a className="btn" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" data-umami-event="WhatsApp click" data-umami-event-location="booking confirmation">
            WhatsApp us now
          </a>
        </div>
      </section>
    );
  }

  const failed = booking.status === "failed" || booking.status === "cancelled";
  return (
    <section className="confirm container">
      <div className="eyebrow">{failed ? "Payment not completed" : "Payment processing"}</div>
      <h1>{failed ? "Your booking wasn’t completed." : "We’re confirming your payment."}</h1>
      <p>
        {failed
          ? "No payment was taken, and the dates have been released. You can try again whenever you’re ready."
          : "This can take a minute for bank transfers. Refresh this page shortly; you'll also get an email as soon as it's confirmed."}
      </p>
      {details}
      <div className="actions">
        <Link className="btn" href={`/stays/${booking.apartmentSlug}`}>
          {failed ? "Try again" : "Back to the apartment"}
        </Link>
        <a className="btn light" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" data-umami-event="WhatsApp click" data-umami-event-location="booking confirmation">
          Need help? WhatsApp us
        </a>
      </div>
    </section>
  );
}
