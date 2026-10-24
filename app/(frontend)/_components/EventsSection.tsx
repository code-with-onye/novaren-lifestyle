import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import type { UpcomingEvent } from "@/lib/events";
import EnquireButton from "./EnquireButton";

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85";

const TZ = "Africa/Lagos";
const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-NG", { timeZone: TZ, ...opts });
const day = fmt({ day: "numeric" });
const month = fmt({ month: "short" });
const weekday = fmt({ weekday: "short" });
const time = fmt({ hour: "numeric", minute: "2-digit" });

const CATEGORY_LABELS: Record<string, string> = {
  dining: "Dining",
  "live-show": "Live show",
  culture: "Culture",
  gathering: "Gathering",
  conversation: "Conversation",
  experience: "Experience",
};

function EventRow({ event }: { event: UpcomingEvent }) {
  const start = new Date(event.startsAt);
  const when = `${weekday.format(start)} · ${time.format(start).toLowerCase()}`;

  return (
    <li className="event-item">
      <time className="datebox" dateTime={event.startsAt}>
        <b>{day.format(start)}</b>
        <small>{month.format(start).toUpperCase()}</small>
      </time>
      <div className="event-info">
        <span className="event-kicker">
          {CATEGORY_LABELS[event.category] ?? event.category} · {when}
        </span>
        <h4>{event.title}</h4>
        <p>
          {event.venue} · {event.summary}
        </p>
        <div className="event-row-foot">
          {event.priceLabel && <span className="price">{event.priceLabel}</span>}
          {event.ticketUrl ? (
            <a className="text-link" href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
              Get tickets ↗
            </a>
          ) : (
            <EnquireButton item={`${event.title} (${day.format(start)} ${month.format(start)})`} type="Events / tickets" className="text-link">
              Enquire ↗
            </EnquireButton>
          )}
        </div>
      </div>
    </li>
  );
}

export default function EventsSection({ events }: { events: UpcomingEvent[] }) {
  const featured = events.find((e) => e.imageUrl);
  const photo = featured?.imageUrl || FALLBACK_PHOTO;

  return (
    <section className="section events" id="events">
      <div className="container event-layout">
        <FadeIn>
          <div className="event-photo">
            <Image
              src={photo}
              alt={featured ? featured.title : "Elegant event venue"}
              fill
              sizes="(max-width: 700px) 100vw, 52vw"
            />
            {featured && (
              <div className="image-note">
                <strong>{featured.title}</strong>
                {featured.venue}
              </div>
            )}
          </div>
        </FadeIn>
        <FadeIn delay={0.1} className="event-content">
          <div className="eyebrow">The city, on your calendar</div>
          <h2>Good plans start here.</h2>
          <p>
            Discover selected happenings around Abuja, from intimate gatherings and dining
            experiences to live shows, culture and conversations worth stepping out for.
          </p>

          {events.length > 0 ? (
            <ul className="event-list" aria-label="Upcoming events">
              {events.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          ) : (
            <ul className="event-list">
              <li className="event-item">
                <div className="datebox">
                  <b>…</b>
                  <small>SOON</small>
                </div>
                <div className="event-info">
                  <h4>New dates are on the way</h4>
                  <p>We&apos;re curating the next season of Abuja experiences with our event partners.</p>
                </div>
              </li>
              <li className="event-item">
                <div className="datebox">
                  <Image src="/logo-mark.png" alt="" width={203} height={164} className="datebox-mark" />
                  <small>CURATED</small>
                </div>
                <div className="event-info">
                  <h4>Something worth going out for</h4>
                  <p>Tell us what you enjoy and we&apos;ll let you know when something fits.</p>
                </div>
              </li>
            </ul>
          )}

          <div className="actions" style={{ marginTop: 24 }}>
            <EnquireButton item="Upcoming events" type="Events / tickets">
              Ask about events
            </EnquireButton>
            <EnquireButton item="Event partnership" type="Partnership" className="btn light">
              Partner with Novaren
            </EnquireButton>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
