import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';

// The homepage shows these as its "stay packages" cards; bust its cached render on change.
const revalidatePackages = () => {
  try {
    revalidatePath('/');
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

export const Packages: CollectionConfig = {
  slug: 'packages',
  labels: {
    singular: 'Stay package',
    plural: 'Stay packages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tier', 'priceFrom', 'unit', 'featured', 'sortOrder', 'published'],
    description: 'Bundled stay packages shown in the "Your Abuja stay, thoughtfully bundled" section of the homepage.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePackages],
    afterDelete: [revalidatePackages],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { width: '60%' },
        },
        {
          name: 'tier',
          type: 'text',
          required: true,
          admin: {
            width: '40%',
            description: 'Small label above the title, e.g. "Essential". The number is added automatically.',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 120,
    },
    {
      name: 'inclusions',
      label: 'What’s included',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Inclusion', plural: 'Inclusions' },
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
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
            width: '50%',
            description: 'Leave blank to show "Price on request".',
          },
        },
        {
          name: 'unit',
          type: 'select',
          defaultValue: 'day',
          options: [
            { label: 'per day', value: 'day' },
            { label: 'per night', value: 'night' },
            { label: 'per stay', value: 'stay' },
            { label: 'No unit', value: 'none' },
          ],
          admin: { width: '50%' },
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlights the card with a gold border and flag.',
      },
    },
    {
      name: 'featuredLabel',
      label: 'Flag text',
      type: 'text',
      defaultValue: 'Most requested',
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => Boolean(siblingData?.featured),
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
        description: 'Untick to hide this package from the website.',
      },
    },
  ],
};
