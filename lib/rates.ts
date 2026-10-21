import { getPayload } from 'payload';
import configPromise from '@payload-config';

export type Rate = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  imageUrl: string;
  imageAlt: string;
};

type RateDoc = {
  id: string | number;
  title: string;
  description: string;
  priceFrom?: number | null;
  priceTo?: number | null;
  unit?: 'night' | 'day' | 'trip' | 'event' | 'none' | null;
  image?: { url?: string | null; alt?: string | null } | string | number | null;
};

const naira = (n: number) => `₦${new Intl.NumberFormat('en-NG').format(n)}`;

/** "₦50,000 – ₦80,000 / night", "From ₦45,000 / day" or "Price on request". */
export function formatPriceLabel(
  priceFrom?: number | null,
  priceTo?: number | null,
  unit?: string | null,
): string {
  if (priceFrom == null) return 'Price on request';
  const suffix = unit && unit !== 'none' ? ` / ${unit}` : '';
  if (priceTo != null && priceTo > priceFrom) {
    return `${naira(priceFrom)} – ${naira(priceTo)}${suffix}`;
  }
  return `From ${naira(priceFrom)}${suffix}`;
}

/** Published rates in display order. Empty when none exist or the CMS is unreachable. */
export async function getRates(): Promise<Rate[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    const rates = await payload.find({
      collection: 'rates',
      where: { published: { equals: true } },
      sort: 'sortOrder',
      limit: 24,
    });

    return (rates.docs as unknown as RateDoc[]).map((doc) => {
      const image = typeof doc.image === 'object' && doc.image ? doc.image : null;
      return {
        id: String(doc.id),
        title: doc.title,
        description: doc.description,
        priceLabel: formatPriceLabel(doc.priceFrom, doc.priceTo, doc.unit),
        imageUrl: image?.url ?? '',
        imageAlt: image?.alt ?? doc.title,
      };
    });
  } catch (error) {
    console.error('Failed to load rates', error);
    return [];
  }
}
