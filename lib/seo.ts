/**
 * Central SEO + structured-data configuration for Novaren Lifestyle.
 *
 * The canonical site URL is env-driven so previews/staging don't leak into
 * canonical tags or the sitemap. Override with NEXT_PUBLIC_SITE_URL.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://novarenlifestyle.cc"
).replace(/\/$/, "");

export const SITE_NAME = "Novaren Lifestyle";
export const SITE_TAGLINE = "Premium Lifestyle Concierge in Abuja";

export const SITE_DESCRIPTION =
  "Novaren Lifestyle is Abuja's premier luxury concierge — private residences, prestige car rentals, VIP access, executive corporate solutions, and bespoke lifestyle management for the global Nigerian and the international traveler.";

export const CONTACT = {
  phone: "+2348036768678",
  phoneDisplay: "+234 803 676 8678",
  whatsapp: "https://wa.me/2348036768678",
  // Service-area business: served regions, no public storefront address.
  areaServed: ["Abuja", "Federal Capital Territory", "Nigeria"],
  city: "Abuja",
  region: "Federal Capital Territory",
  country: "NG",
  // Approximate geo center of Abuja for local relevance signals.
  geo: { latitude: 9.0765, longitude: 7.3986 },
};

export const SOCIAL = {
  instagram: "https://www.instagram.com/novarenlifestyle",
};

/** Default Open Graph share image (generated at build-prep, lives in /public). */
export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
};

export const KEYWORDS = [
  "Abuja luxury concierge",
  "Abuja lifestyle management",
  "luxury car rental Abuja",
  "private residences Abuja",
  "VIP concierge Nigeria",
  "executive concierge Abuja",
  "prestige rentals Abuja",
  "Novaren Lifestyle",
  "luxury travel Nigeria",
  "Abuja short-let apartments",
];

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/* ------------------------------------------------------------------ */
/* JSON-LD structured data (helps SEO + generative-engine citation)    */
/* ------------------------------------------------------------------ */

/**
 * Organization + service-area LocalBusiness graph. Rendered sitewide so
 * search and AI engines have a single, consistent entity for the brand.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "Novaren",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo-light.png"),
    },
    image: OG_IMAGE.url,
    description: SITE_DESCRIPTION,
    slogan: "The gateway to luxury in Abuja.",
    telephone: CONTACT.phone,
    priceRange: "$$$",
    // Service-area business — no street address, but a clear served region.
    areaServed: CONTACT.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT.city,
      addressRegion: CONTACT.region,
      addressCountry: CONTACT.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CONTACT.geo.latitude,
      longitude: CONTACT.geo.longitude,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phone,
      contactType: "customer service",
      areaServed: "NG",
      availableLanguage: ["en"],
    },
    sameAs: Object.values(SOCIAL),
  };
}

/** WebSite entity (enables sitelinks/search understanding). */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
}

/** BreadcrumbList from ordered [name, path] pairs. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Service offering tied back to the brand organization. */
export function serviceJsonLd(service: {
  name: string;
  description: string;
  path?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    serviceType: service.name,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: CONTACT.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    ...(service.path ? { url: absoluteUrl(service.path) } : {}),
  };
}
