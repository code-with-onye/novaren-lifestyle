import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

const title = "Our Approach";
const description =
  "How Novaren Lifestyle works: rigorous vendor and supplier vetting, an experience-first doctrine where nothing is recommended unvetted, and intentional network building across Abuja's premium establishments.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/approach" },
  openGraph: {
    title,
    description,
    url: "/approach",
    type: "website",
  },
  twitter: { title, description },
};

export default function ApproachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Approach", path: "/approach" },
        ])}
      />
      {children}
    </>
  );
}
