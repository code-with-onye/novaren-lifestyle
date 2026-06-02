import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

const title = "Inquire & Book";
const description =
  "Begin your Novaren Lifestyle experience. Inquire about luxury residences, prestige car rentals, VIP concierge access, and bespoke lifestyle management in Abuja. Discreet, direct, and tailored to you.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/inquire" },
  openGraph: {
    title,
    description,
    url: "/inquire",
    type: "website",
  },
  twitter: { title, description },
};

export default function InquireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Inquire", path: "/inquire" },
        ])}
      />
      {children}
    </>
  );
}
