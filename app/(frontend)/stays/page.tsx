import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getPublishedApartments } from "@/lib/bookings";
import StaysBrowser, { type StayCard } from "./_components/StaysBrowser";

const description =
  "Book a Novaren shortlet apartment in Abuja online. See availability, choose your dates and pay securely with Paystack.";

// Editing an apartment in the CMS revalidates immediately; this is a safety net.
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Shortlet stays",
  description,
  alternates: { canonical: "/stays" },
  openGraph: { title: "Shortlet stays in Abuja", description, url: "/stays", type: "website" },
  twitter: { title: "Shortlet stays in Abuja", description },
};

export default async function StaysPage() {
  const apartments = await getPublishedApartments();
  const stays: StayCard[] = apartments.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    area: a.area,
    bedrooms: a.bedrooms,
    bathrooms: a.bathrooms,
    maxGuests: a.maxGuests,
    nightlyRate: a.nightlyRate,
    minNights: a.minNights,
    cover: a.photos[0] ?? null,
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Stays", path: "/stays" },
        ])}
      />

      <header className="stays-head container">
        <div>
          <div className="eyebrow">Shortlet stays</div>
          <h1>Apartments in Abuja</h1>
        </div>
        <p>Checked by our team. See the full price up front and book in minutes, paid securely with Paystack.</p>
      </header>

      {stays.length === 0 ? (
        <section className="section">
          <div className="stays-empty">
            <h2>New apartments are on the way.</h2>
            <p>Tell us your dates and we&apos;ll find the right place for you.</p>
            <Link className="btn" href="/#concierge">
              Request a stay <span className="arrow">↗</span>
            </Link>
          </div>
        </section>
      ) : (
        <StaysBrowser stays={stays} />
      )}
    </>
  );
}
