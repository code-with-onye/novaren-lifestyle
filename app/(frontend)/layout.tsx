import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import SiteNav from "./_components/SiteNav";
import SiteFooter from "./_components/SiteFooter";
import { WhatsAppIcon } from "./_components/icons";
import { CONTACT } from "./_components/site";
import { staysEnabled } from "@/lib/features";
import {
  SITE_URL,
  SITE_NAME,
  KEYWORDS,
  OG_IMAGE,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const title = `${SITE_NAME} | Stays, Fleets & Concierge in Abuja`;

const siteHost = new URL(SITE_URL).hostname.replace(/^www\./, "");
const TRACKED_DOMAINS = `${siteHost},www.${siteHost}`;
const description =
  "Thoughtfully arranged stays, movement and experiences in Abuja. Accommodation, car hire, stay packages, events and personal concierge, all coordinated through one point of contact.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: `%s | ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Lifestyle & Concierge",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: SITE_NAME,
    title,
    description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#173e32",
};

export default function SiteRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="nv">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <span id="home" />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteNav staysEnabled={staysEnabled()} />
        <main id="main">{children}</main>
        <SiteFooter staysEnabled={staysEnabled()} />
        <a
          className="wa-float"
          href={CONTACT.whatsapp}
          data-umami-event="WhatsApp click" data-umami-event-location="floating button"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
        >
          <WhatsAppIcon />
        </a>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="4b1c4089-0ea1-4ae6-87f7-96b65cf6de6d"
          // Only count visits on the live site, not localhost or preview deployments.
          data-domains={TRACKED_DOMAINS}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
