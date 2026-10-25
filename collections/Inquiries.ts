import { CollectionConfig } from 'payload';

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'inquiryType', 'status', 'createdAt'],
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== 'create') return;
        // Email the person and the team. Never let an email problem fail the submission:
        // the enquiry is already saved and visible in the admin panel.
        try {
          const { sendInquiryEmails } = await import('../lib/inquiry-emails');
          await sendInquiryEmails(doc);
        } catch (error) {
          console.error('[inquiries] Could not send enquiry emails', error);
        }
      },
    ],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'inquiryType',
      type: 'select',
      required: true,
      options: [
        { label: 'Curated Stay (Shortlet)', value: 'curated-stay' },
        { label: 'Prestige Mobility (Car Rental)', value: 'prestige-mobility' },
        { label: 'The Abuja Access (Concierge)', value: 'the-abuja-access' },
        { label: 'Brand Partnership', value: 'brand-partnership' },
        { label: 'General Inquiry', value: 'general-inquiry' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Resolved', value: 'resolved' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
