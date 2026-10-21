import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';

// The homepage shows these as its "Everything in its right place" cards; bust its cached render on change.
const revalidateServices = () => {
  try {
    revalidatePath('/');
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Service card',
    plural: 'Service cards',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kicker', 'target', 'sortOrder', 'published'],
    description: 'The four image cards in the "Everything in its right place" section of the homepage.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateServices],
    afterDelete: [revalidateServices],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'Large text on the card, e.g. "Stays".' },
        },
        {
          name: 'kicker',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
            description: 'Small label above the title, e.g. "Stay". The number is added automatically.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'linkLabel',
          label: 'Link text',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'e.g. "Explore accommodation".' },
        },
        {
          name: 'target',
          label: 'Links to',
          type: 'select',
          required: true,
          defaultValue: '#concierge',
          options: [
            { label: 'Indicative rates', value: '#pricing' },
            { label: 'Stay packages', value: '#packages' },
            { label: 'Wheels', value: '#wheels' },
            { label: 'Events', value: '#events' },
            { label: 'Concierge form', value: '#concierge' },
            { label: 'FAQs', value: '#faq' },
            { label: 'Custom URL', value: 'custom' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'customUrl',
      label: 'Custom URL',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.target === 'custom',
        description: 'A page on this site (e.g. /journal) or a full https:// link.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: { target?: string } }) =>
        siblingData?.target !== 'custom' || (typeof value === 'string' && value.trim() !== '')
          ? true
          : 'Enter a URL or choose another "Links to" option.',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'sortOrder',
      label: 'Display order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers show first.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Untick to hide this card from the website.',
      },
    },
  ],
};
