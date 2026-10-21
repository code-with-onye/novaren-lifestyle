import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';

// The homepage shows these in its "Wheels, arranged" section; bust its cached render on change.
const revalidateVehicles = () => {
  try {
    revalidatePath('/');
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
  labels: {
    singular: 'Vehicle',
    plural: 'Vehicles',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'priceFrom', 'unit', 'sortOrder', 'published'],
    description: 'Vehicle types shown in the "Wheels, arranged" section of the homepage.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateVehicles],
    afterDelete: [revalidateVehicles],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 100,
      admin: {
        description: 'One line, e.g. "Airport transfers, appointments and everyday city movement."',
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
            width: '50%',
            description: 'Leave blank to show "Price on request".',
          },
        },
        {
          name: 'unit',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'per day', value: 'day' },
            { label: 'per trip', value: 'trip' },
            { label: 'per hour', value: 'hour' },
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
        description: 'Untick to hide this vehicle from the website.',
      },
    },
  ],
};
