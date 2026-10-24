import type { Field } from 'payload';

// Absolute ("/#…") so the same values work from any page.
export const LINK_OPTIONS = [
  { label: 'Homepage: Services', value: '/#services' },
  { label: 'Homepage: Indicative rates', value: '/#pricing' },
  { label: 'Homepage: Stay packages', value: '/#packages' },
  { label: 'Homepage: Fleets', value: '/#wheels' },
  { label: 'Homepage: Events', value: '/#events' },
  { label: 'Homepage: Concierge form', value: '/#concierge' },
  { label: 'Editorial', value: '/journal' },
  { label: 'About', value: '/about' },
  { label: 'Custom URL', value: 'custom' },
];

/** A button: its text plus where it links (a site section or a custom URL). */
export const linkButton = (
  name: string,
  label: string,
  defaults: { text: string; target: string },
): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          label: 'Button text',
          type: 'text',
          required: true,
          defaultValue: defaults.text,
          admin: { width: '50%' },
        },
        {
          name: 'target',
          label: 'Links to',
          type: 'select',
          required: true,
          defaultValue: defaults.target,
          options: LINK_OPTIONS,
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
    },
  ],
});
