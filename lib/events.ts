import { getPayload } from 'payload';
import configPromise from '@payload-config';

export type UpcomingEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  category: string;
  venue: string;
  summary: string;
  priceLabel: string;
  ticketUrl: string;
  imageUrl: string;
};

type EventDoc = {
  id: string | number;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  category: string;
  venue: string;
  summary: string;
  priceLabel?: string | null;
  ticketUrl?: string | null;
  image?: { url?: string | null } | string | number | null;
};

/**
 * Published events that haven't finished yet, soonest first. An event counts as
 * upcoming until its end time, or its start time when no end is set.
 */
export async function getUpcomingEvents(limit = 4): Promise<UpcomingEvent[]> {
  const now = new Date().toISOString();

  try {
    const payload = await getPayload({ config: configPromise });
    const events = await payload.find({
      collection: 'events',
      where: {
        and: [
          { published: { equals: true } },
          {
            or: [
              { endsAt: { greater_than_equal: now } },
              {
                and: [{ endsAt: { exists: false } }, { startsAt: { greater_than_equal: now } }],
              },
            ],
          },
        ],
      },
      sort: 'startsAt',
      limit,
    });

    return (events.docs as unknown as EventDoc[]).map((doc) => ({
      id: String(doc.id),
      title: doc.title,
      startsAt: doc.startsAt,
      endsAt: doc.endsAt ?? null,
      category: doc.category,
      venue: doc.venue,
      summary: doc.summary,
      priceLabel: doc.priceLabel ?? '',
      ticketUrl: doc.ticketUrl ?? '',
      imageUrl: typeof doc.image === 'object' && doc.image?.url ? doc.image.url : '',
    }));
  } catch (error) {
    // Don't take the whole page down if the CMS is unreachable; the section
    // falls back to its "coming soon" state.
    console.error('Failed to load upcoming events', error);
    return [];
  }
}
