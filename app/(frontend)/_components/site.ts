import { CONTACT, SOCIAL } from "@/lib/seo";

// Section links are absolute ("/#…") so they work from the journal pages too.
export const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#pricing", label: "Stays" },
  { href: "/#packages", label: "Stay Packages" },
  { href: "/#wheels", label: "Wheels" },
  { href: "/#events", label: "Events" },
  { href: "/journal", label: "Journal" },
  { href: "/#concierge", label: "Concierge" },
] as const;

export const EMAIL = "novarenlifestyle@yahoo.com";
export { CONTACT, SOCIAL };

/** Options for the concierge form, mapped onto the Inquiries collection's `inquiryType`. */
export const REQUEST_TYPES = [
  { label: "General concierge request", value: "the-abuja-access" },
  { label: "Accommodation", value: "curated-stay" },
  { label: "Stay package", value: "curated-stay" },
  { label: "Transportation", value: "prestige-mobility" },
  { label: "Events / tickets", value: "the-abuja-access" },
  { label: "Fast-tracking", value: "the-abuja-access" },
  { label: "Gifting / special occasion", value: "the-abuja-access" },
  { label: "Partnership", value: "brand-partnership" },
  { label: "Other", value: "general-inquiry" },
] as const;

export type RequestType = (typeof REQUEST_TYPES)[number]["label"];

export const ENQUIRE_EVENT = "novaren:enquire";

export type EnquireDetail = { item: string; type: RequestType };
