import { getPayload } from 'payload';
import configPromise from '@payload-config';

export type Principle = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

type PrincipleDoc = {
  id: string | number;
  title: string;
  description: string;
  image?: { url?: string | null; alt?: string | null } | string | number | null;
};

/** Published "How we work" cards in display order. Empty when none exist or the CMS is unreachable. */
export async function getPrinciples(): Promise<Principle[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    const principles = await payload.find({
      collection: 'principles',
      where: { published: { equals: true } },
      sort: 'sortOrder',
      limit: 12,
    });

    return (principles.docs as unknown as PrincipleDoc[]).map((doc) => {
      const image = typeof doc.image === 'object' && doc.image ? doc.image : null;
      return {
        id: String(doc.id),
        title: doc.title,
        description: doc.description,
        imageUrl: image?.url ?? '',
        imageAlt: image?.alt ?? doc.title,
      };
    });
  } catch (error) {
    console.error('Failed to load principles', error);
    return [];
  }
}
