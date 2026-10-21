import { getPayload } from 'payload';
import configPromise from '@payload-config';

export type ServiceCard = {
  id: string;
  title: string;
  kicker: string;
  linkLabel: string;
  href: string;
  external: boolean;
  imageUrl: string;
  imageAlt: string;
};

type ServiceDoc = {
  id: string | number;
  title: string;
  kicker: string;
  linkLabel: string;
  target: string;
  customUrl?: string | null;
  image?: { url?: string | null; alt?: string | null } | string | number | null;
};

/** Published service cards in display order. Empty when none exist or the CMS is unreachable. */
export async function getServiceCards(): Promise<ServiceCard[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    const services = await payload.find({
      collection: 'services',
      where: { published: { equals: true } },
      sort: 'sortOrder',
      limit: 8,
    });

    return (services.docs as unknown as ServiceDoc[]).map((doc) => {
      const image = typeof doc.image === 'object' && doc.image ? doc.image : null;
      const href = doc.target === 'custom' ? doc.customUrl?.trim() || '#concierge' : doc.target;
      return {
        id: String(doc.id),
        title: doc.title,
        kicker: doc.kicker,
        linkLabel: doc.linkLabel,
        href,
        external: /^https?:\/\//.test(href),
        imageUrl: image?.url ?? '',
        imageAlt: image?.alt ?? doc.title,
      };
    });
  } catch (error) {
    console.error('Failed to load service cards', error);
    return [];
  }
}
