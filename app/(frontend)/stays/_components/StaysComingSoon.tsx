import Link from "next/link";
import { CONTACT } from "@/lib/seo";

/** Shown in place of the stays pages while online booking is switched off. */
export default function StaysComingSoon() {
  return (
    <section className="confirm container">
      <div className="eyebrow">Shortlet stays</div>
      <h1>Online booking opens soon.</h1>
      <p>
        We&apos;re putting the finishing touches on booking our apartments online. In the meantime, tell us your
        dates and the kind of place you&apos;re after, and we&apos;ll arrange your stay for you.
      </p>
      <div className="actions">
        <Link className="btn" href="/#concierge">
          Request a stay <span className="arrow">↗</span>
        </Link>
        <a
          className="btn light"
          href={CONTACT.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="WhatsApp click"
          data-umami-event-location="stays coming soon"
        >
          WhatsApp us
        </a>
      </div>
      <p className="stays-soon-rates">
        <Link href="/#pricing" className="text-link">
          See indicative rates
        </Link>
      </p>
    </section>
  );
}
