import type { GlobalConfig } from 'payload';
import { revalidatePath } from 'next/cache';
import { linkButton } from './fields';

// The homepage renders this hero; bust its cached render on change.
const revalidateHome = () => {
  try {
    revalidatePath('/');
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

export const HomepageHero: GlobalConfig = {
  slug: 'homepage-hero',
  label: 'Homepage hero',
  admin: {
    description: 'The first section visitors see on the homepage. Empty fields fall back to the default copy.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateHome],
  },
  fields: [
    {
      name: 'eyebrow',
      label: 'Small label',
      type: 'text',
      admin: { description: 'Gold text above the headline.' },
    },
    {
      name: 'headline',
      type: 'textarea',
      admin: {
        rows: 2,
        description: 'Each new line in this box starts a new line on the page.',
      },
    },
    {
      name: 'headlineAccent',
      label: 'Headline accent',
      type: 'text',
      admin: { description: 'Final line, shown in green italics.' },
    },
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 240,
    },
    linkButton('primaryButton', 'Main button', { text: 'Explore our services', target: '/#services' }),
    linkButton('secondaryButton', 'Second button', { text: 'Request a concierge', target: '/#concierge' }),
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Large photo on the right. Landscape or square works best.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'noteTitle',
          label: 'Photo caption title',
          type: 'text',
          admin: { width: '50%', description: 'e.g. "Abuja, made easier."' },
        },
        {
          name: 'noteText',
          label: 'Photo caption text',
          type: 'text',
          admin: { width: '50%', description: 'e.g. "Stays · Fleets · Access · Moments"' },
        },
      ],
    },
    {
      name: 'highlights',
      label: 'Highlights strip',
      type: 'array',
      maxRows: 6,
      labels: { singular: 'Highlight', plural: 'Highlights' },
      admin: { description: 'Short phrases in the strip under the hero.' },
      fields: [{ name: 'text', type: 'text', required: true }],
    },
  ],
};
