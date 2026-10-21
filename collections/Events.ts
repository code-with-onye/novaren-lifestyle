import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';

// The homepage lists upcoming events; bust its cached render whenever one changes.
const revalidateEvents = () => {
  try {
    revalidatePath('/');
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'venue', 'category', 'published'],
  },
  defaultSort: 'startsAt',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateEvents],
    afterDelete: [revalidateEvents],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'startsAt',
      label: 'Starts at',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', timeFormat: 'h:mm a' },
      },
    },
    {
      name: 'endsAt',
      label: 'Ends at',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', timeFormat: 'h:mm a' },
        description: 'Optional. Events stay listed until they end (or start, if no end is set).',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Untick to hide this event from the website.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'experience',
      options: [
        { label: 'Dining', value: 'dining' },
        { label: 'Live show', value: 'live-show' },
        { label: 'Culture', value: 'culture' },
        { label: 'Gathering', value: 'gathering' },
        { label: 'Conversation', value: 'conversation' },
        { label: 'Experience', value: 'experience' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'venue',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      maxLength: 160,
      admin: {
        description: 'One or two lines shown in the events list.',
      },
    },
    {
      name: 'priceLabel',
      label: 'Price label',
      type: 'text',
      admin: {
        description: 'e.g. "From ₦25,000" or "Invite only". Leave blank to hide.',
      },
    },
    {
      name: 'ticketUrl',
      label: 'Ticket link',
      type: 'text',
      admin: {
        description: 'Optional external ticket page. Without one, visitors enquire through the concierge form.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional. The next upcoming event with an image is featured beside the list.',
      },
    },
  ],
};
