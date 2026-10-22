import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';

// The About page shows these in its "How we work" section; bust its cached render on change.
const revalidatePrinciples = () => {
  try {
    revalidatePath('/about');
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

export const Principles: CollectionConfig = {
  slug: 'principles',
  labels: {
    singular: 'How we work card',
    plural: 'How we work',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder', 'published'],
    description: 'The image cards in the "How we work" section of the About page.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidatePrinciples],
    afterDelete: [revalidatePrinciples],
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
      maxLength: 320,
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
        description: 'Lower numbers show first. The 01, 02… numbers follow this order.',
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
