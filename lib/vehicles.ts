import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { formatPriceLabel } from './rates';

export type Vehicle = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  imageUrl: string;
  imageAlt: string;
};

type VehicleDoc = {
  id: string | number;
  title: string;
  description: string;
  priceFrom?: number | null;
  unit?: 'day' | 'trip' | 'hour' | 'none' | null;
  image?: { url?: string | null; alt?: string | null } | string | number | null;
};

/** Published vehicles in display order. Empty when none exist or the CMS is unreachable. */
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    const vehicles = await payload.find({
      collection: 'vehicles',
      where: { published: { equals: true } },
      sort: 'sortOrder',
      limit: 12,
    });

    return (vehicles.docs as unknown as VehicleDoc[]).map((doc) => {
      const image = typeof doc.image === 'object' && doc.image ? doc.image : null;
      return {
        id: String(doc.id),
        title: doc.title,
        description: doc.description,
        priceLabel: formatPriceLabel(doc.priceFrom, null, doc.unit),
        imageUrl: image?.url ?? '',
        imageAlt: image?.alt ?? doc.title,
      };
    });
  } catch (error) {
    console.error('Failed to load vehicles', error);
    return [];
  }
}
