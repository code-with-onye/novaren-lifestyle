// Helpers for turning CMS global fields into render-ready values, falling back
// to the page's built-in copy whenever a field is left empty.

export type CmsButton = { label: string; href: string; external: boolean };

export type ButtonDoc = { label?: string | null; target?: string | null; customUrl?: string | null } | null;

export type ImageDoc = { url?: string | null; alt?: string | null } | string | number | null | undefined;

export const text = (value: string | null | undefined, fallback: string) => value?.trim() || fallback;

export function toButton(doc: ButtonDoc | undefined, fallback: CmsButton): CmsButton {
  const label = doc?.label?.trim();
  if (!label || !doc?.target) return fallback;
  const href = doc.target === 'custom' ? doc.customUrl?.trim() || fallback.href : doc.target;
  return { label, href, external: /^https?:\/\//.test(href) };
}

/** The populated upload, or null when it is missing or only an ID. */
export function toImage(doc: ImageDoc): { url: string; alt: string } | null {
  if (typeof doc !== 'object' || !doc?.url) return null;
  return { url: doc.url, alt: doc.alt ?? '' };
}

/** Non-empty array from the CMS, else the fallback. */
export function list<T>(items: T[], fallback: T[]): T[] {
  return items.length ? items : fallback;
}
