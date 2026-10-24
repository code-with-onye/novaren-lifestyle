import type { CollectionConfig } from 'payload';
import { revalidatePath } from 'next/cache';

// Shortlet listings, bookable online at /stays/[slug].
const revalidateStays = (slug?: string) => {
  try {
    revalidatePath('/stays');
    revalidatePath('/sitemap.xml');
    if (slug) revalidatePath(`/stays/${slug}`);
  } catch {
    // Outside a Next request (e.g. seed scripts) there is no cache to revalidate.
  }
};

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const Apartments: CollectionConfig = {
  slug: 'apartments',
  labels: {
    singular: 'Shortlet apartment',
    plural: 'Shortlet apartments',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'area', 'nightlyRate', 'maxGuests', 'published'],
    description: 'Apartments guests can book and pay for online at /stays.',
  },
  defaultSort: 'sortOrder',
  access: {
    // The public sees published listings only; logged-in staff see drafts too.
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
  },
  hooks: {
    afterChange: [({ doc }) => revalidateStays(doc?.slug)],
    afterDelete: [({ doc }) => revalidateStays(doc?.slug)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Listing',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                {
                  name: 'area',
                  type: 'text',
                  required: true,
                  admin: { width: '40%', description: 'Neighbourhood shown publicly, e.g. "Maitama".' },
                },
              ],
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: { description: 'Web address: /stays/<slug>. Lowercase words joined with dashes.' },
              validate: (value: unknown) => {
                if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
                  return 'Use lowercase letters, numbers and dashes only, e.g. "maitama-one-bedroom".';
                }
                // /stays/confirmation is the payment return page.
                return value === 'confirmation' ? 'That address is reserved. Please choose another.' : true;
              },
            },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              maxLength: 160,
              admin: { description: 'One or two lines for the listing card.' },
            },
            { name: 'description', type: 'textarea', required: true },
            {
              type: 'row',
              fields: [
                { name: 'bedrooms', type: 'number', required: true, min: 0, defaultValue: 1, admin: { width: '33%' } },
                { name: 'bathrooms', type: 'number', required: true, min: 0, defaultValue: 1, admin: { width: '33%' } },
                { name: 'maxGuests', label: 'Max guests', type: 'number', required: true, min: 1, defaultValue: 2, admin: { width: '33%' } },
              ],
            },
            {
              name: 'gallery',
              type: 'array',
              required: true,
              minRows: 1,
              maxRows: 12,
              labels: { singular: 'Photo', plural: 'Photos' },
              admin: { description: 'The first photo is the cover. Drag to reorder.' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
            {
              name: 'amenities',
              type: 'array',
              labels: { singular: 'Amenity', plural: 'Amenities' },
              fields: [{ name: 'item', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Pricing & rules',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'nightlyRate',
                  label: 'Nightly rate (₦)',
                  type: 'number',
                  required: true,
                  min: 1,
                  admin: { width: '33%' },
                },
                {
                  name: 'cautionDeposit',
                  label: 'Caution deposit (₦)',
                  type: 'number',
                  required: true,
                  min: 0,
                  defaultValue: 0,
                  admin: { width: '33%', description: 'Refundable. Charged with the booking.' },
                },
                {
                  name: 'minNights',
                  label: 'Minimum nights',
                  type: 'number',
                  required: true,
                  min: 1,
                  defaultValue: 1,
                  admin: { width: '33%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'checkInTime', label: 'Check-in from', type: 'text', required: true, defaultValue: '2:00 pm', admin: { width: '50%' } },
                { name: 'checkOutTime', label: 'Check-out by', type: 'text', required: true, defaultValue: '12:00 pm', admin: { width: '50%' } },
              ],
            },
            {
              name: 'houseRules',
              label: 'House rules',
              type: 'array',
              labels: { singular: 'Rule', plural: 'Rules' },
              fields: [{ name: 'item', type: 'text', required: true }],
            },
            {
              name: 'arrivalInstructions',
              label: 'Arrival instructions (private)',
              type: 'textarea',
              access: { read: loggedIn },
              admin: {
                description: 'Exact address, access codes, parking. Only sent in the confirmation email; never shown on the website.',
              },
            },
          ],
        },
        {
          label: 'Availability',
          fields: [
            {
              name: 'blockedDates',
              label: 'Blocked dates',
              type: 'array',
              labels: { singular: 'Blocked period', plural: 'Blocked periods' },
              admin: {
                description: 'Nights that cannot be booked online (maintenance, bookings taken elsewhere). Paid bookings block their own dates automatically.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'from', label: 'First night', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
                    { name: 'to', label: 'Last night', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
                    { name: 'note', type: 'text', admin: { width: '33%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Show on /stays and accept bookings. Unpublished listings can still be previewed (and test-booked) while logged in.',
      },
    },
    {
      name: 'sortOrder',
      label: 'Display order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers show first.' },
    },
  ],
};
