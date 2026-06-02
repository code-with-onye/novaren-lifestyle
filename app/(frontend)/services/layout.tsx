import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd, absoluteUrl } from "@/lib/seo";

const title = "Services";
const description =
  "Explore Novaren Lifestyle's luxury services in Abuja: Novaren Stays (private residences in Maitama, Wuse 2 & Asokoro), Novaren Wheels (chauffeured & self-drive luxury fleet), Novaren Access (VIP concierge), corporate solutions, event curation, gifting, and curated travel.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/services" },
  openGraph: {
    title,
    description,
    url: "/services",
    type: "website",
  },
  twitter: { title, description },
};

// Mirrors the SERVICES offered on the page — kept concise for structured data.
const SERVICE_SCHEMA = [
  {
    name: "Novaren Stays — Luxury Private Residences",
    description:
      "Curated short-term luxury residences in Maitama, Wuse 2, and Asokoro with elite security, concierge, and prime Abuja locations.",
  },
  {
    name: "Novaren Wheels — Prestige Car Rentals",
    description:
      "A premier fleet of luxury SUVs and executive sedans with professional chauffeur or self-drive options across Abuja.",
  },
  {
    name: "Novaren Access — VIP Concierge",
    description:
      "Bespoke concierge: airport fast-track, priority reservations at exclusive venues, private chef and wellness sourcing, and personalized itineraries.",
  },
  {
    name: "Corporate Solutions",
    description:
      "Strategic logistics partner for embassies, multinationals, and startups — executive soft-landing, secure logistics, and partner retainers.",
  },
  {
    name: "Novaren Moments — Event Curation",
    description:
      "Intimate event experiences, room decoration, and vendor sourcing, plus trusted Abuja event recommendations.",
  },
  {
    name: "Gifting & Procurement",
    description:
      "Bespoke luxury gifts, hampers, and end-to-end procurement for corporate and personal occasions.",
  },
  {
    name: "Curated Travel Experiences",
    description:
      "Planned, vetted, and booked weekend getaways, Nigeria trips, and curated itineraries beyond Abuja.",
  },
];

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Novaren Lifestyle Services",
    itemListElement: SERVICE_SCHEMA.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: absoluteUrl("/services"),
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          itemList,
          ...SERVICE_SCHEMA.map((s) =>
            serviceJsonLd({ ...s, path: "/services" })
          ),
        ]}
      />
      {children}
    </>
  );
}
