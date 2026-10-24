import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { list, text, toButton, toImage, type ButtonDoc, type CmsButton, type ImageDoc } from './cms-fields';

export type AboutCard = { id: string; title: string; description: string; imageUrl: string; imageAlt: string };
export type RoadmapPhase = { id: string; title: string; description: string };

export type About = {
  storyEyebrow: string;
  storyTitle: string;
  storyTitleAccent: string;
  storyLead: string;
  storyBody: string;
  workEyebrow: string;
  workTitle: string;
  workIntro: string;
  principles: AboutCard[];
  visionEyebrow: string;
  visionTitle: string;
  visionIntro: string;
  roadmap: RoadmapPhase[];
  quote: string;
  quoteAttribution: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaPrimary: CmsButton;
  ctaSecondary: CmsButton;
};

type Str = string | null | undefined;

type AboutDoc = {
  storyEyebrow?: Str;
  storyTitle?: Str;
  storyTitleAccent?: Str;
  storyLead?: Str;
  storyBody?: Str;
  workEyebrow?: Str;
  workTitle?: Str;
  workIntro?: Str;
  principles?: { id?: Str; title?: Str; description?: Str; image?: ImageDoc }[] | null;
  visionEyebrow?: Str;
  visionTitle?: Str;
  visionIntro?: Str;
  roadmap?: { id?: Str; title?: Str; description?: Str }[] | null;
  quote?: Str;
  quoteAttribution?: Str;
  ctaEyebrow?: Str;
  ctaTitle?: Str;
  ctaPrimary?: ButtonDoc;
  ctaSecondary?: ButtonDoc;
};

/**
 * The About page content from the CMS, with each empty field falling back to
 * `fallback`. Returns the fallback untouched if the CMS is unreachable.
 */
export async function getAbout(fallback: About): Promise<About> {
  try {
    const payload = await getPayload({ config: configPromise });
    const doc = (await payload.findGlobal({ slug: 'about-page' })) as unknown as AboutDoc;

    const principles = (doc.principles ?? []).flatMap((p, i) => {
      const image = toImage(p.image);
      if (!p.title || !p.description || !image) return [];
      return [{
        id: p.id ?? String(i),
        title: p.title,
        description: p.description,
        imageUrl: image.url,
        imageAlt: image.alt || p.title,
      }];
    });
    const roadmap = (doc.roadmap ?? []).flatMap((r, i) =>
      r.title && r.description ? [{ id: r.id ?? String(i), title: r.title, description: r.description }] : [],
    );

    return {
      storyEyebrow: text(doc.storyEyebrow, fallback.storyEyebrow),
      storyTitle: text(doc.storyTitle, fallback.storyTitle),
      storyTitleAccent: text(doc.storyTitleAccent, fallback.storyTitleAccent),
      storyLead: text(doc.storyLead, fallback.storyLead),
      storyBody: text(doc.storyBody, fallback.storyBody),
      workEyebrow: text(doc.workEyebrow, fallback.workEyebrow),
      workTitle: text(doc.workTitle, fallback.workTitle),
      workIntro: text(doc.workIntro, fallback.workIntro),
      principles: list(principles, fallback.principles),
      visionEyebrow: text(doc.visionEyebrow, fallback.visionEyebrow),
      visionTitle: text(doc.visionTitle, fallback.visionTitle),
      visionIntro: text(doc.visionIntro, fallback.visionIntro),
      roadmap: list(roadmap, fallback.roadmap),
      quote: text(doc.quote, fallback.quote),
      quoteAttribution: text(doc.quoteAttribution, fallback.quoteAttribution),
      ctaEyebrow: text(doc.ctaEyebrow, fallback.ctaEyebrow),
      ctaTitle: text(doc.ctaTitle, fallback.ctaTitle),
      ctaPrimary: toButton(doc.ctaPrimary, fallback.ctaPrimary),
      ctaSecondary: toButton(doc.ctaSecondary, fallback.ctaSecondary),
    };
  } catch (error) {
    console.error('Failed to load About page content', error);
    return fallback;
  }
}
