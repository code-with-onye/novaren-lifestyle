import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { formatPriceLabel } from './rates';

export type StayPackage = {
  id: string;
  title: string;
  tier: string;
  description: string;
  inclusions: string[];
  priceLabel: string;
  imageUrl: string;
  imageAlt: string;
  featuredLabel: string | null;
};

type PackageDoc = {
  id: string | number;
  title: string;
  tier: string;
  description: string;
  inclusions?: { item: string }[] | null;
  priceFrom?: number | null;
  unit?: 'day' | 'night' | 'stay' | 'none' | null;
  image?: { url?: string | null; alt?: string | null } | string | number | null;
  featured?: boolean | null;
  featuredLabel?: string | null;
};

/** Published stay packages in display order. Empty when none exist or the CMS is unreachable. */
export async function getPackages(): Promise<StayPackage[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    const packages = await payload.find({
      collection: 'packages',
      where: { published: { equals: true } },
      sort: 'sortOrder',
      limit: 12,
    });

    return (packages.docs as unknown as PackageDoc[]).map((doc) => {
      const image = typeof doc.image === 'object' && doc.image ? doc.image : null;
      return {
        id: String(doc.id),
        title: doc.title,
        tier: doc.tier,
        description: doc.description,
        inclusions: (doc.inclusions ?? []).map((i) => i.item),
        priceLabel: formatPriceLabel(doc.priceFrom, null, doc.unit),
        imageUrl: image?.url ?? '',
        imageAlt: image?.alt ?? doc.title,
        featuredLabel: doc.featured ? doc.featuredLabel || 'Most requested' : null,
      };
    });
  } catch (error) {
    console.error('Failed to load packages', error);
    return [];
  }
}
