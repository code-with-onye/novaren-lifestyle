import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getApartmentBySlug, getUnavailableNights } from "@/lib/bookings";
import { todayInAbuja } from "@/lib/dates";
import BookingWidget from "../_components/BookingWidget";
import BookingPanel from "../_components/BookingPanel";
import StayGallery from "../_components/StayGallery";

type Props = { params: Promise<{ slug: string }> };

async function isAdmin() {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });
  return Boolean(user);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apartment = await getApartmentBySlug(slug, false);
  if (!apartment) return { title: "Stay", robots: { index: false } };
  const url = `/stays/${apartment.slug}`;
  return {
    title: `${apartment.name}, ${apartment.area}`,
    description: apartment.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${apartment.name}, ${apartment.area}`,
      description: apartment.summary,
      url,
      images: apartment.photos[0] ? [{ url: apartment.photos[0].url, alt: apartment.photos[0].alt }] : undefined,
    },
  };
}

// Availability must be live, so this page always renders on request.
export default async function StayPage({ params }: Props) {
  const { slug } = await params;
  const admin = await isAdmin();
  const apartment = await getApartmentBySlug(slug, admin);
  if (!apartment) notFound();
  const unavailable = await getUnavailableNights(apartment.id);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Stays", path: "/stays" },
          { name: apartment.name, path: `/stays/${apartment.slug}` },
        ])}
      />

      {!apartment.published && (
        <p className="stay-preview-note">
          Preview: this listing is unpublished and only visible to you while logged in. Test bookings work here.
        </p>
      )}

      <section className="stay-head container">
        <Link href="/stays" className="post-back">
          ← All stays
        </Link>
        <div className="post-meta">
          <span>{apartment.area}</span>
          <span>
            {apartment.bedrooms === 0 ? "Studio" : `${apartment.bedrooms} bedroom${apartment.bedrooms > 1 ? "s" : ""}`} ·{" "}
            {apartment.bathrooms} bath · up to {apartment.maxGuests} guests
          </span>
        </div>
        <h1>{apartment.name}</h1>
      </section>

      <StayGallery photos={apartment.photos} />

      <section className="stay-body container">
        <div className="stay-info">
          <p className="stay-lead">{apartment.summary}</p>
          <div className="stay-description">
            {apartment.description.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {apartment.amenities.length > 0 && (
            <>
              <h2>What this place offers</h2>
              <ul className="stay-amenities">
                {apartment.amenities.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </>
          )}

          <h2>Good to know</h2>
          <ul className="concierge-list stay-rules">
            <li>Check-in from {apartment.checkInTime}, check-out by {apartment.checkOutTime}</li>
            {apartment.minNights > 1 && <li>Minimum stay of {apartment.minNights} nights</li>}
            {apartment.cautionDeposit > 0 && (
              <li>A refundable caution deposit is collected with your booking and returned after check-out</li>
            )}
            {apartment.houseRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
            <li>The exact address and arrival details are sent in your confirmation email</li>
          </ul>
        </div>

        <BookingPanel nightlyRate={apartment.nightlyRate} minNights={apartment.minNights}>
          <BookingWidget
            apartmentId={apartment.id}
            apartmentName={apartment.name}
            nightlyRate={apartment.nightlyRate}
            cautionDeposit={apartment.cautionDeposit}
            minNights={apartment.minNights}
            maxGuests={apartment.maxGuests}
            checkInTime={apartment.checkInTime}
            checkOutTime={apartment.checkOutTime}
            today={todayInAbuja()}
            unavailable={unavailable}
          />
        </BookingPanel>
      </section>
    </>
  );
}
