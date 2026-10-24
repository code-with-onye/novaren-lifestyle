import type { CollectionConfig } from 'payload';

// Created by the booking flow (server-side, Local API), never directly by the public.
const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: 'Booking', plural: 'Bookings' },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'apartment', 'checkIn', 'checkOut', 'guestName', 'total', 'status'],
    description: 'Online shortlet bookings. "Confirmed" means Paystack payment was verified.',
  },
  defaultSort: '-createdAt',
  access: {
    create: () => false,
    read: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'reference', type: 'text', required: true, unique: true, admin: { readOnly: true, width: '50%' } },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          admin: { width: '50%' },
          options: [
            { label: 'Awaiting payment', value: 'pending' },
            { label: 'Confirmed (paid)', value: 'confirmed' },
            { label: 'Paid, dates clashed: refund needed', value: 'needs-refund' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Payment failed / abandoned', value: 'failed' },
          ],
        },
      ],
    },
    { name: 'apartment', type: 'relationship', relationTo: 'apartments', required: true },
    {
      type: 'row',
      fields: [
        { name: 'checkIn', label: 'Check-in', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
        { name: 'checkOut', label: 'Check-out', type: 'date', required: true, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
        { name: 'nights', type: 'number', required: true, admin: { width: '17%' } },
        { name: 'guests', type: 'number', required: true, admin: { width: '17%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'guestName', label: 'Guest name', type: 'text', required: true, admin: { width: '33%' } },
        { name: 'guestEmail', label: 'Guest email', type: 'email', required: true, admin: { width: '33%' } },
        { name: 'guestPhone', label: 'Guest phone', type: 'text', required: true, admin: { width: '33%' } },
      ],
    },
    { name: 'notes', label: 'Guest notes', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'nightlyRate', label: 'Nightly rate (₦)', type: 'number', required: true, admin: { readOnly: true, width: '25%' } },
        { name: 'staySubtotal', label: 'Stay (₦)', type: 'number', required: true, admin: { readOnly: true, width: '25%' } },
        { name: 'cautionDeposit', label: 'Caution deposit (₦)', type: 'number', required: true, admin: { readOnly: true, width: '25%' } },
        { name: 'total', label: 'Total paid (₦)', type: 'number', required: true, admin: { readOnly: true, width: '25%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'paidAt', label: 'Paid at', type: 'date', admin: { readOnly: true, width: '33%', date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'paystackTransactionId', label: 'Paystack transaction', type: 'text', admin: { readOnly: true, width: '33%' } },
        { name: 'paymentChannel', label: 'Paid with', type: 'text', admin: { readOnly: true, width: '33%' } },
      ],
    },
    {
      name: 'emailsSentAt',
      label: 'Confirmation emails sent',
      type: 'date',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
};
