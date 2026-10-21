import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';

// The homepage shows these as its "indicative rates" grid; bust its cached render on change.
const revalidateRates = () => {
  try {
    revalidatePath('/');
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

export const Rates: CollectionConfig = {
  slug: 'rates',
  labels: {
    singular: 'Rate',
    plural: 'Rates',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'group', 'priceFrom', 'priceTo', 'unit', 'sortOrder', 'published'],
    description: 'Indicative price ranges shown in the "Know the range" section of the homepage.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateRates],
    afterDelete: [revalidateRates],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      maxLength: 60,
      admin: {
        description: 'Short line under the title, e.g. "Compact, considered stays".',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'priceFrom',
          label: 'Price from (₦)',
          type: 'number',
          min: 0,
          admin: {
            width: '33%',
            description: 'Leave blank to show "Price on request".',
          },
        },
        {
          name: 'priceTo',
          label: 'Price to (₦)',
          type: 'number',
          min: 0,
          admin: {
            width: '33%',
            description: 'Optional. Without it the card shows "From ₦…".',
          },
        },
        {
          name: 'unit',
          type: 'select',
          defaultValue: 'night',
          options: [
            { label: 'per night', value: 'night' },
            { label: 'per day', value: 'day' },
            { label: 'per trip', value: 'trip' },
            { label: 'per event', value: 'event' },
            { label: 'No unit', value: 'none' },
          ],
          admin: {
            width: '33%',
          },
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'stays',
      options: [
        { label: 'Stays', value: 'stays' },
        { label: 'Venues', value: 'venues' },
        { label: 'Vehicles', value: 'vehicles' },
      ],
      admin: {
        position: 'sidebar',
      },
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
        description: 'Untick to hide this rate from the website.',
      },
    },
  ],
};
