import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getPrinciples, type Principle } from "@/lib/principles";

const description =
  "The story behind Novaren Lifestyle: an Abuja concierge built on firsthand experience, carefully vetted partners and a trusted local network.";

// Re-render hourly as a safety net; editing a card in the CMS also revalidates immediately.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Novaren Lifestyle",
    description,
    url: "/about",
    type: "website",
  },
  twitter: { title: "About Novaren Lifestyle", description },
};

const img = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

// Shown until cards are added in the CMS (Admin → How we work).
const FALLBACK_PRINCIPLES = [
  {
    title: "Vendor & supplier vetting",
    desc: "We build and manage direct relationships with premier apartment owners, luxury fleet operators and venue managers. Rigorous vetting means our standards of quality, reliability and discretion are never compromised.",
    image: "photo-1600585154340-be6161a56a0c",
    alt: "Modern architect-designed home at dusk",
  },
  {
    title: "Experience first",
    desc: "Our recommendations never rely on guesswork. The Novaren team personally dines at, stays in and evaluates every property and establishment before presenting it to a client. Firsthand knowledge is what sets us apart.",
    image: "photo-1578474846511-04ba529f0b88",
    alt: "Warmly lit fine-dining room",
  },
  {
    title: "Intentional network building",
    desc: "We stay close to the pulse of the city. By representing Novaren at premier events and within professional circles, we keep a network that turns into genuine access and tailored opportunities for our clients.",
    image: "photo-1527529482837-4698179dc6ce",
    alt: "Guests raising a toast at a celebration",
  },
];

const ROADMAP = [
  {
    title: "The Abuja ecosystem",
    desc: "Direct, middleman-free relationships with premium apartment owners and luxury fleets, so we control the quality and the standards.",
  },
  {
    title: "The Novaren Pass",
    desc: "In development: an access tier offering VIP entry and priority reservations at Abuja's most sought-after establishments.",
  },
  {
    title: "Pan-Nigeria",
    desc: "Curated travel experiences across Nigeria, bringing the same careful vetting to high-value destinations nationwide.",
  },
  {
    title: "Global footprint",
    desc: "Expanding across Africa and beyond, with the same rule throughout: we experience it firsthand before we recommend it to you.",
  },
];

export default async function AboutPage() {
  const cmsPrinciples = await getPrinciples();
  const principles: Principle[] = cmsPrinciples.length
    ? cmsPrinciples
    : FALLBACK_PRINCIPLES.map((p) => ({
        id: p.title,
        title: p.title,
        description: p.desc,
        imageUrl: img(p.image, 900),
        imageAlt: p.alt,
      }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <section className="about-hero">
        <FadeIn className="about-hero-copy">
          <div className="eyebrow">The brand story</div>
          <h1>
            The Novaren <em>standard.</em>
          </h1>
        </FadeIn>
        <FadeIn delay={0.1} className="about-hero-text">
          <p>
            Novaren Lifestyle was born from a simple observation: Abuja is a city of hidden gems,
            but reaching them takes more than a map. It takes a relationship. We are a lifestyle
            management company dedicated to bridging the gap between luxury and local insight.
          </p>
          <p>
            For the global Nigerian and the international traveller, we are the trusted partner who
            makes your time in the capital seamless, secure and considered.
          </p>
        </FadeIn>
      </section>

      <section className="section about-principles">
        <div className="container">
          <FadeIn className="section-head">
            <div className="eyebrow">How we work</div>
            <h2>Support beyond access.</h2>
            <p>
              Behind every seamless experience is a carefully structured operation. This is how we
              protect quality, reliability and discretion.
            </p>
          </FadeIn>
          <div className="principle-grid">
            {principles.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08}>
                <article className="principle">
                  <div className="principle-img">
                    {p.imageUrl && (
                      <Image src={p.imageUrl} alt={p.imageAlt} fill sizes="(max-width: 700px) 100vw, 33vw" />
                    )}
                  </div>
                  <span className="badge">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-vision">
        <div className="container about-vision-layout">
          <FadeIn className="about-vision-intro">
            <div className="eyebrow">Our north star</div>
            <h2>Built in Abuja. Growing with care.</h2>
            <p>
              A steady path to becoming the most trusted premium lifestyle concierge in Africa,
              beginning in the capital.
            </p>
          </FadeIn>
          <ol className="roadmap">
            {ROADMAP.map((r, i) => (
              <FadeIn key={r.title} delay={i * 0.08}>
                <li>
                  <span className="roadmap-phase">Phase {String(i + 1).padStart(2, "0")}</span>
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-quote">
        <FadeIn>
          <blockquote>
            <p>
              Every decision we make, every booking, every conversation and every event we attend
              moves us closer to the ultimate considered experience.
            </p>
            <footer>The Novaren team</footer>
          </blockquote>
        </FadeIn>
      </section>

      <section className="final-cta">
        <FadeIn>
          <div className="eyebrow">Ready when you are</div>
          <h2>Tell us what you have in mind.</h2>
          <div className="actions">
            <Link className="btn" href="/#concierge">
              Request a concierge <span className="arrow">↗</span>
            </Link>
            <Link className="btn light" href="/journal">
              Read our editorial
            </Link>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
