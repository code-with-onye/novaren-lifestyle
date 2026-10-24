import type { GlobalConfig } from 'payload';
import { revalidatePath } from 'next/cache';
import { linkButton } from './fields';

// The About page renders this global; bust its cached render on change.
const revalidateAbout = () => {
  try {
    revalidatePath('/about');
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About page',
  admin: {
    description: 'Everything on /about. Empty fields fall back to the default copy.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateAbout],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand story',
          fields: [
            { name: 'storyEyebrow', label: 'Small label', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'storyTitle', label: 'Title', type: 'text', admin: { width: '50%' } },
                {
                  name: 'storyTitleAccent',
                  label: 'Title accent',
                  type: 'text',
                  admin: { width: '50%', description: 'Shown in green italics after the title.' },
                },
              ],
            },
            {
              name: 'storyLead',
              label: 'Opening paragraph',
              type: 'textarea',
              admin: { description: 'Shown larger, in the serif typeface.' },
            },
            { name: 'storyBody', label: 'Second paragraph', type: 'textarea' },
          ],
        },
        {
          label: 'How we work',
          fields: [
            { name: 'workEyebrow', label: 'Small label', type: 'text' },
            { name: 'workTitle', label: 'Title', type: 'text' },
            { name: 'workIntro', label: 'Intro', type: 'textarea' },
            {
              name: 'principles',
              label: 'Cards',
              type: 'array',
              maxRows: 6,
              labels: { singular: 'Card', plural: 'Cards' },
              admin: { description: 'Numbered 01, 02… in this order. Drag to reorder.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea', required: true, maxLength: 320 },
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
              ],
            },
          ],
        },
        {
          label: 'North star',
          fields: [
            { name: 'visionEyebrow', label: 'Small label', type: 'text' },
            { name: 'visionTitle', label: 'Title', type: 'text' },
            { name: 'visionIntro', label: 'Intro', type: 'textarea' },
            {
              name: 'roadmap',
              label: 'Roadmap phases',
              type: 'array',
              maxRows: 8,
              labels: { singular: 'Phase', plural: 'Phases' },
              admin: { description: 'Numbered Phase 01, 02… in this order. Drag to reorder.' },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Closing',
          fields: [
            { name: 'quote', type: 'textarea' },
            { name: 'quoteAttribution', label: 'Quote attribution', type: 'text' },
            { name: 'ctaEyebrow', label: 'Closing small label', type: 'text' },
            { name: 'ctaTitle', label: 'Closing title', type: 'text' },
            linkButton('ctaPrimary', 'Main button', { text: 'Request a concierge', target: '/#concierge' }),
            linkButton('ctaSecondary', 'Second button', { text: 'Read our editorial', target: '/journal' }),
          ],
        },
      ],
    },
  ],
};
