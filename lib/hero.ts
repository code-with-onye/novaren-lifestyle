import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { list, text, toButton, toImage, type ButtonDoc, type CmsButton, type ImageDoc } from './cms-fields';

export type Hero = {
  eyebrow: string;
  headlineLines: string[];
  headlineAccent: string;
  intro: string;
  primaryButton: CmsButton;
  secondaryButton: CmsButton;
  imageUrl: string;
  imageAlt: string;
  noteTitle: string;
  noteText: string;
  highlights: string[];
};

type HeroDoc = {
  eyebrow?: string | null;
  headline?: string | null;
  headlineAccent?: string | null;
  intro?: string | null;
  primaryButton?: ButtonDoc;
  secondaryButton?: ButtonDoc;
  image?: ImageDoc;
  noteTitle?: string | null;
  noteText?: string | null;
  highlights?: { text?: string | null }[] | null;
};

/**
 * The homepage hero from the CMS, with each empty field falling back to
 * `fallback`. Returns the fallback untouched if the CMS is unreachable.
 */
export async function getHero(fallback: Hero): Promise<Hero> {
  try {
    const payload = await getPayload({ config: configPromise });
    const doc = (await payload.findGlobal({ slug: 'homepage-hero' })) as unknown as HeroDoc;
    const image = toImage(doc.image);
    const lines = (doc.headline ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
    const highlights = (doc.highlights ?? [])
      .map((h) => h.text?.trim())
      .filter((t): t is string => Boolean(t));

    return {
      eyebrow: text(doc.eyebrow, fallback.eyebrow),
      headlineLines: list(lines, fallback.headlineLines),
      headlineAccent: text(doc.headlineAccent, fallback.headlineAccent),
      intro: text(doc.intro, fallback.intro),
      primaryButton: toButton(doc.primaryButton, fallback.primaryButton),
      secondaryButton: toButton(doc.secondaryButton, fallback.secondaryButton),
      imageUrl: image?.url ?? fallback.imageUrl,
      imageAlt: image ? image.alt || fallback.imageAlt : fallback.imageAlt,
      noteTitle: text(doc.noteTitle, fallback.noteTitle),
      noteText: text(doc.noteText, fallback.noteText),
      highlights: list(highlights, fallback.highlights),
    };
  } catch (error) {
    console.error('Failed to load homepage hero', error);
    return fallback;
  }
}
