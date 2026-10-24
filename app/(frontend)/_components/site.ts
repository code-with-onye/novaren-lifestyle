import { CONTACT, SOCIAL } from "@/lib/seo";

// Kept short on purpose; "Enquire" is the header button. Section links are
// absolute ("/#…") so they work from other pages too.
export const NAV_LINKS = [
  { href: "/stays", label: "Stays" },
  { href: "/#wheels", label: "Fleets" },
  { href: "/#events", label: "Events" },
  { href: "/journal", label: "Editorial" },
  { href: "/about", label: "About" },
] as const;

// Top-level pages whose nav link stays highlighted on them and their subpages.
const PAGE_LINKS = ["/stays", "/journal", "/about"];

export function activePageLink(pathname: string): string | null {
  return PAGE_LINKS.find((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? null;
}

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
export const PROMO_OPEN_EVENT = "novaren:promo-open";

export type EnquireDetail = { item: string; type: RequestType };
