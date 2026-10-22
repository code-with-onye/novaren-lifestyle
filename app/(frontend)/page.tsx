import type { Metadata } from "next";
import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import ConciergeForm from "./_components/ConciergeForm";
import EnquireButton from "./_components/EnquireButton";
import EventsSection from "./_components/EventsSection";
import PromoModal, { PromoTrigger } from "./_components/PromoModal";
import { CONTACT, type RequestType } from "./_components/site";
import { getUpcomingEvents } from "@/lib/events";
import { getRates, type Rate } from "@/lib/rates";
import { getPackages, type StayPackage } from "@/lib/packages";
import { getVehicles, type Vehicle } from "@/lib/vehicles";
import { getServiceCards, type ServiceCard } from "@/lib/services";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Re-render hourly so past events drop off; edits in the CMS revalidate immediately.
export const revalidate = 3600;

const img = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const IMG = {
  living: "photo-1600210492486-724fe5c67fb0",
  car: "photo-1503376780353-7e6692767b70",
  dining: "photo-1517248135467-4c7edcad34c4",
  event: "photo-1511795409834-ef04bbd61622",
  studio: "photo-1616486338812-3dadae4b4ace",
  oneBed: "photo-1600607687939-ce8a6c25118c",
  twoBed: "photo-1600607687920-4e2a09cf159d",
  threeBed: "photo-1600566753086-00f18fb6b3ea",
  suv: "photo-1519641471654-76ce0107ad1b",
  bus: "photo-1549317661-bd32c8ce0db2",
};

// Shown until service cards are added in the CMS (Admin → Service cards).
const FALLBACK_SERVICES = [
  { n: "01 / Stay", title: "Stays", cta: "Explore accommodation", href: "#pricing", img: IMG.living, alt: "Warm neutral living room" },
  { n: "02 / Move", title: "Fleets", cta: "Find your ride", href: "#wheels", img: IMG.car, alt: "Executive car" },
  { n: "03 / Discover", title: "Access", cta: "Explore experiences", href: "#concierge", img: IMG.dining, alt: "Restaurant dining setting" },
  { n: "04 / Gather", title: "Moments", cta: "See what's happening", href: "#events", img: IMG.event, alt: "Elegant event tables" },
];

// Shown until rates are added in the CMS (Admin → Rates).
const FALLBACK_RATES = [
  { title: "Studio", desc: "Compact, considered stays", price: "₦[XX,XXX] – ₦[XX,XXX] / night", img: IMG.studio, alt: "Studio interior" },
  { title: "1-bedroom", desc: "For work or a quiet escape", price: "₦[XX,XXX] – ₦[XX,XXX] / night", img: IMG.oneBed, alt: "One bedroom interior" },
  { title: "2-bedroom", desc: "Room to settle in", price: "₦[XX,XXX] – ₦[XX,XXX] / night", img: IMG.twoBed, alt: "Apartment living room" },
  { title: "3-bedroom", desc: "For families and groups", price: "₦[XX,XXX] – ₦[XX,XXX] / night", img: IMG.threeBed, alt: "Spacious home interior" },
  { title: "Villas & private homes", desc: "More privacy, more room", price: "₦[XX,XXX] – ₦[XXX,XXX] / night", img: IMG.living, alt: "Private residence" },
  { title: "Party spaces", desc: "Selected venues by enquiry", price: "From ₦[XXX,XXX]", img: IMG.dining, alt: "Event venue" },
  { title: "Sedan", desc: "Transfers and daily hire", price: "From ₦[XX,XXX]", img: IMG.car, alt: "Sedan car" },
  { title: "SUV", desc: "Extra room and comfort", price: "From ₦[XX,XXX]", img: IMG.suv, alt: "SUV vehicle" },
  { title: "Buses & group transport", desc: "For groups and coordinated trips", price: "From ₦[XX,XXX]", img: IMG.bus, alt: "Passenger vehicle" },
];

// Shown until packages are added in the CMS (Admin → Stay packages).
const FALLBACK_PACKAGES = [
  { badge: "01 · Essential", title: "Essential Stay", desc: "A practical, comfortable base for a solo traveller or short visit.", items: ["Studio accommodation", "Sedan transfer / agreed use", "Arrival coordination"], img: IMG.studio },
  { badge: "02 · Executive", title: "Executive Stay", desc: "A little more space, with the essentials arranged around you.", items: ["1-bedroom apartment", "Sedan or SUV option", "Personalised coordination"], img: IMG.oneBed, featured: true },
  { badge: "03 · Premium", title: "Premium Stay", desc: "More space and coordinated movement for a fuller itinerary.", items: ["2-bedroom apartment", "SUV with agreed terms", "Enhanced stay coordination"], img: IMG.twoBed },
  { badge: "04 · Group", title: "Private Stay", desc: "For families, friends or teams travelling together.", items: ["3-bedroom home or villa", "SUV / group transport option", "Coordinated group requests"], img: IMG.threeBed },
];

// Shown until vehicles are added in the CMS (Admin → Vehicles).
const FALLBACK_FLEET = [
  { title: "Executive Sedan", desc: "Airport transfers, appointments and everyday city movement.", img: IMG.car },
  { title: "Premium SUV", desc: "More space for luggage, companions and longer days out.", img: IMG.suv },
  { title: "Group Transport", desc: "Coordinated transport for teams, families and group plans.", img: IMG.bus },
];

const FAQS = [
  { q: "How do I book a stay or a vehicle?", a: "Send us your dates, preferred location or vehicle type, and any relevant details. We will confirm availability and provide a quotation before you proceed with payment." },
  { q: "What does concierge service include?", a: "Concierge support is tailored to your request. We review what you need, confirm feasibility, scope and fees, and proceed only after the details are agreed." },
  { q: "How does your fast-tracking service work?", a: "Fast-tracking details will be published once the exact service, eligibility, provider and inclusions are confirmed. Contact Novaren to enquire about current availability." },
  { q: "Can I enquire about an event or buy tickets through Novaren?", a: "Yes, for events where Novaren has an agreed arrangement with the organiser. Ticket availability, price, payment and refund terms will be confirmed before you purchase." },
];

const PACKAGE_TYPE: RequestType = "Stay package";
const FLEET_TYPE: RequestType = "Transportation";

export default async function LifestylePage() {
  const [events, cmsRates, cmsPackages, cmsVehicles, cmsServices] = await Promise.all([
    getUpcomingEvents(),
    getRates(),
    getPackages(),
    getVehicles(),
    getServiceCards(),
  ]);
  const services: ServiceCard[] = cmsServices.length
    ? cmsServices
    : FALLBACK_SERVICES.map((sv) => ({
        id: sv.title,
        title: sv.title,
        kicker: sv.n.split(" / ")[1],
        linkLabel: sv.cta,
        href: sv.href,
        external: false,
        imageUrl: img(sv.img, 800),
        imageAlt: sv.alt,
      }));
  const fleet: Vehicle[] = cmsVehicles.length
    ? cmsVehicles
    : FALLBACK_FLEET.map((c) => ({
        id: c.title,
        title: c.title,
        description: c.desc,
        priceLabel: "From ₦[RATE]",
        imageUrl: img(c.img, 900),
        imageAlt: c.title,
      }));
  const packages: StayPackage[] = cmsPackages.length
    ? cmsPackages
    : FALLBACK_PACKAGES.map((p) => ({
        id: p.title,
        title: p.title,
        tier: p.badge.split(" · ")[1],
        description: p.desc,
        inclusions: p.items,
        priceLabel: "From ₦[PRICE] / day",
        imageUrl: img(p.img, 700),
        imageAlt: p.title,
        featuredLabel: p.featured ? "Most requested" : null,
      }));
  const rates: Rate[] = cmsRates.length
    ? cmsRates
    : FALLBACK_RATES.map((r) => ({
        id: r.title,
        title: r.title,
        description: r.desc,
        priceLabel: r.price,
        imageUrl: img(r.img, 300),
        imageAlt: r.alt,
      }));

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-copy">
          <FadeIn>
            <div className="eyebrow">A more considered way to experience Abuja</div>
            <h1>
              Your time.
              <br />
              Your comfort.
              <br />
              <em>Beautifully arranged.</em>
            </h1>
            <p>
              From a welcoming place to stay to the car that meets you and the experiences that
              make a trip memorable, Novaren brings the details together.
            </p>
            <div className="actions">
              <a className="btn" href="#services">
                Explore our services
              </a>
              <a className="btn light" href="#concierge">
                Request a concierge
              </a>
            </div>
          </FadeIn>
        </div>
        <div className="hero-image">
          <Image
            src={img(IMG.living, 1500)}
            alt="Warm, light-filled living room"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 52vw"
          />
          <div className="image-note">
            <strong>Abuja, made easier.</strong>
            Stays · Fleets · Access · Moments
          </div>
        </div>
      </section>

      <div className="truststrip">
        <span>Considered recommendations</span>
        <span>One point of contact</span>
        <span>Personalised arrangements</span>
        <span>Abuja insight</span>
      </div>

      {/* Services */}
      <section className="section" id="services">
        <div className="container">
          <FadeIn className="section-head">
            <div className="eyebrow">The Novaren experience</div>
            <h2>Everything in its right place.</h2>
            <p>
              Practical support, thoughtful details and experiences arranged around the way you
              want to spend your time.
            </p>
          </FadeIn>
          <div className="service-grid">
            {services.map((s, i) => (
              <FadeIn key={s.id} delay={i * 0.08}>
                <a
                  className="service-card"
                  id={i === 0 ? "stays" : undefined}
                  href={s.href}
                  {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {s.imageUrl && (
                    <Image src={s.imageUrl} alt={s.imageAlt} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 25vw" />
                  )}
                  <div className="service-text">
                    <small>
                      {String(i + 1).padStart(2, "0")} / {s.kicker}
                    </small>
                    <h3>{s.title}</h3>
                    <span>{s.linkLabel} ↗</span>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Indicative rates */}
      <section className="section pricing" id="pricing">
        <div className="container">
          <FadeIn className="section-head">
            <div className="eyebrow">A helpful starting point</div>
            <h2>Know the range. Then make it yours.</h2>
            <p>
              Indicative rates help you plan. Exact pricing depends on dates, availability,
              location and the details of your request.
            </p>
          </FadeIn>
          <div className="price-grid">
            {rates.map((r) => (
              <div className="price-card" key={r.id}>
                <div className="price-thumb">
                  {r.imageUrl && <Image src={r.imageUrl} alt={r.imageAlt} fill sizes="92px" />}
                </div>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.description}</p>
                  <div className="price">{r.priceLabel}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="note">
            Indicative ranges only. Final prices are confirmed with your quotation. Supplier
            availability and terms apply.
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="section packages" id="packages">
        <div className="container">
          <FadeIn className="section-head">
            <div className="eyebrow">Arrive with less to organise</div>
            <h2>Your Abuja stay, thoughtfully bundled.</h2>
            <p>
              Accommodation, transportation and personal assistance coordinated through one point
              of contact. December packages are being curated.
            </p>
            {cmsPackages.length > 0 && <PromoTrigger />}
          </FadeIn>
          <div className="package-grid">
            {packages.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08} className="package-wrap">
                <article className={`package${p.featuredLabel ? " featured" : ""}`} style={{ height: "100%" }}>
                  {p.featuredLabel && <span className="package-flag">{p.featuredLabel}</span>}
                  <div className="package-img">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.imageAlt} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 25vw" />}
                  </div>
                  <div className="package-body">
                    <span className="badge">
                      {String(i + 1).padStart(2, "0")} · {p.tier}
                    </span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <ul>
                      {p.inclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <span className="price">{p.priceLabel}</span>
                    <EnquireButton item={p.title} type={PACKAGE_TYPE}>
                      Enquire about package
                    </EnquireButton>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
          <p className="note">
            Package inclusions, vehicle hours, fuel, deposits and multi-day rates are confirmed
            before booking.
          </p>
        </div>
      </section>

      {/* Fleet */}
      <section className="section fleet" id="wheels">
        <div className="container">
          <FadeIn className="section-head">
            <div className="eyebrow">Fleets, arranged</div>
            <h2>Move through the city with ease.</h2>
            <p>
              Choose the type of ride that suits your plans. Specific vehicles and rates are
              confirmed against your dates.
            </p>
          </FadeIn>
          <div className="fleet-grid">
            {fleet.map((c, i) => (
              <FadeIn key={c.id} delay={i * 0.08}>
                <article className="car">
                  <div className="car-img">
                    {c.imageUrl && <Image src={c.imageUrl} alt={c.imageAlt} fill sizes="(max-width: 700px) 100vw, 33vw" />}
                  </div>
                  <div className="car-body">
                    <h3>{c.title}</h3>
                    <p>{c.description}</p>
                    <div className="car-bottom">
                      <span className="price">{c.priceLabel}</span>
                      <EnquireButton item={c.title} type={FLEET_TYPE}>
                        Enquire
                      </EnquireButton>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
          <p className="note">
            Vehicle availability, hours, fuel and driver terms are confirmed with each booking.
          </p>
        </div>
      </section>

      <EventsSection events={events} />

      {/* Concierge */}
      <section className="section" id="concierge">
        <div className="container concierge">
          <FadeIn>
            <div className="eyebrow">A little more personal</div>
            <h2>Tell us what would make life easier.</h2>
            <p>
              Not every request fits into a category. If you need someone to research, coordinate
              or arrange the details, tell us what you have in mind.
            </p>
            <ul className="concierge-list">
              <li>Restaurant and experience reservations</li>
              <li>Gifting and thoughtful surprises</li>
              <li>Airport transfers and transportation</li>
              <li>Personal errands and tailored requests</li>
              <li>Stay, event and itinerary coordination</li>
            </ul>
            <p className="fine">
              Every request is reviewed for availability, feasibility and cost before
              confirmation.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ConciergeForm />
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq" id="faq">
        <div className="container">
          <FadeIn className="section-head">
            <div className="eyebrow">A few useful details</div>
            <h2>Frequently asked questions</h2>
            <p>A little clarity before you make a request.</p>
          </FadeIn>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <details className="faq-item" key={f.q} open={i === 0}>
                <summary>
                  {f.q}
                  <span className="faq-icon" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <FadeIn>
          <div className="eyebrow">Make room for what matters</div>
          <h2>Let us take care of the details.</h2>
          <div className="actions">
            <a className="btn" href="#concierge">
              Start an enquiry <span className="arrow">↗</span>
            </a>
            <a className="btn light" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          </div>
        </FadeIn>
      </section>
      {cmsPackages.length > 0 && (
        <PromoModal
          packages={cmsPackages.map((p) => ({
            id: p.id,
            title: p.title,
            priceLabel: p.priceLabel,
            featuredLabel: p.featuredLabel,
          }))}
        />
      )}
    </>
  );
}
