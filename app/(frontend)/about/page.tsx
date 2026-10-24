import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getAbout, type About } from "@/lib/about";
import type { CmsButton } from "@/lib/cms-fields";

const description =
  "The story behind Novaren Lifestyle: an Abuja concierge built on firsthand experience, carefully vetted partners and a trusted local network.";

// Re-render hourly as a safety net; saving the About page in the CMS also revalidates immediately.
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

// Used for any field left empty in the CMS (Admin → Globals → About page).
const FALLBACK: About = {
  storyEyebrow: "The brand story",
  storyTitle: "The Novaren",
  storyTitleAccent: "standard.",
  storyLead:
    "Novaren Lifestyle was born from a simple observation: Abuja is a city of hidden gems, but reaching them takes more than a map. It takes a relationship. We are a lifestyle management company dedicated to bridging the gap between luxury and local insight.",
  storyBody:
    "For the global Nigerian and the international traveller, we are the trusted partner who makes your time in the capital seamless, secure and considered.",
  workEyebrow: "How we work",
  workTitle: "Support beyond access.",
  workIntro:
    "Behind every seamless experience is a carefully structured operation. This is how we protect quality, reliability and discretion.",
  principles: [
    {
      id: "vetting",
      title: "Vendor & supplier vetting",
      description:
        "We build and manage direct relationships with premier apartment owners, luxury fleet operators and venue managers. Rigorous vetting means our standards of quality, reliability and discretion are never compromised.",
      imageUrl: img("photo-1600585154340-be6161a56a0c", 900),
      imageAlt: "Modern architect-designed home at dusk",
    },
    {
      id: "experience",
      title: "Experience first",
      description:
        "Our recommendations never rely on guesswork. The Novaren team personally dines at, stays in and evaluates every property and establishment before presenting it to a client. Firsthand knowledge is what sets us apart.",
      imageUrl: img("photo-1578474846511-04ba529f0b88", 900),
      imageAlt: "Warmly lit fine-dining room",
    },
    {
      id: "network",
      title: "Intentional network building",
      description:
        "We stay close to the pulse of the city. By representing Novaren at premier events and within professional circles, we keep a network that turns into genuine access and tailored opportunities for our clients.",
      imageUrl: img("photo-1527529482837-4698179dc6ce", 900),
      imageAlt: "Guests raising a toast at a celebration",
    },
  ],
  visionEyebrow: "Our north star",
  visionTitle: "Built in Abuja. Growing with care.",
  visionIntro:
    "A steady path to becoming the most trusted premium lifestyle concierge in Africa, beginning in the capital.",
  roadmap: [
    {
      id: "abuja",
      title: "The Abuja ecosystem",
      description:
        "Direct, middleman-free relationships with premium apartment owners and luxury fleets, so we control the quality and the standards.",
    },
    {
      id: "pass",
      title: "The Novaren Pass",
      description:
        "In development: an access tier offering VIP entry and priority reservations at Abuja's most sought-after establishments.",
    },
    {
      id: "nigeria",
      title: "Pan-Nigeria",
      description:
        "Curated travel experiences across Nigeria, bringing the same careful vetting to high-value destinations nationwide.",
    },
    {
      id: "global",
      title: "Global footprint",
      description:
        "Expanding across Africa and beyond, with the same rule throughout: we experience it firsthand before we recommend it to you.",
    },
  ],
  quote:
    "Every decision we make, every booking, every conversation and every event we attend moves us closer to the ultimate considered experience.",
  quoteAttribution: "The Novaren team",
  ctaEyebrow: "Ready when you are",
  ctaTitle: "Tell us what you have in mind.",
  ctaPrimary: { label: "Request a concierge", href: "/#concierge", external: false },
  ctaSecondary: { label: "Read our editorial", href: "/journal", external: false },
};

function CmsLink({ button, className, arrow }: { button: CmsButton; className: string; arrow?: boolean }) {
  return (
    <Link
      className={className}
      href={button.href}
      {...(button.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {button.label}
      {arrow && <span className="arrow"> ↗</span>}
    </Link>
  );
}

export default async function AboutPage() {
  const about = await getAbout(FALLBACK);

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
          <div className="eyebrow">{about.storyEyebrow}</div>
          <h1>
            {about.storyTitle} <em>{about.storyTitleAccent}</em>
          </h1>
        </FadeIn>
        <FadeIn delay={0.1} className="about-hero-text">
          <p>{about.storyLead}</p>
          <p>{about.storyBody}</p>
        </FadeIn>
      </section>

      <section className="section about-principles">
        <div className="container">
          <FadeIn className="section-head">
            <div className="eyebrow">{about.workEyebrow}</div>
            <h2>{about.workTitle}</h2>
            <p>{about.workIntro}</p>
          </FadeIn>
          <div className="principle-grid">
            {about.principles.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08}>
                <article className="principle">
                  <div className="principle-img">
                    <Image src={p.imageUrl} alt={p.imageAlt} fill sizes="(max-width: 700px) 100vw, 33vw" />
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
            <div className="eyebrow">{about.visionEyebrow}</div>
            <h2>{about.visionTitle}</h2>
            <p>{about.visionIntro}</p>
          </FadeIn>
          <ol className="roadmap">
            {about.roadmap.map((r, i) => (
              <FadeIn key={r.id} delay={i * 0.08}>
                <li>
                  <span className="roadmap-phase">Phase {String(i + 1).padStart(2, "0")}</span>
                  <h3>{r.title}</h3>
                  <p>{r.description}</p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      <section className="about-quote">
        <FadeIn>
          <blockquote>
            <p>{about.quote}</p>
            <footer>{about.quoteAttribution}</footer>
          </blockquote>
        </FadeIn>
      </section>

      <section className="final-cta">
        <FadeIn>
          <div className="eyebrow">{about.ctaEyebrow}</div>
          <h2>{about.ctaTitle}</h2>
          <div className="actions">
            <CmsLink className="btn" button={about.ctaPrimary} arrow />
            <CmsLink className="btn light" button={about.ctaSecondary} />
          </div>
        </FadeIn>
      </section>
    </>
  );
}
