import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { revalidatePath } from 'next/cache';

// Frontend routes that read from this collection. When a post changes we must
// invalidate Next's full-route cache for each of them, otherwise the statically
// rendered pages keep serving the build-time snapshot and new/edited posts
// never appear. See lib/journal.ts consumers: /journal, /journal/[slug], sitemap.
const revalidateJournal = (slug?: string) => {
  revalidatePath('/journal');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/journal/${slug}`);
};

export const JournalPosts: CollectionConfig = {
  slug: 'journal-posts',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateJournal(doc?.slug);
        // If the slug changed, the old detail path needs busting too.
        if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
          revalidatePath(`/journal/${previousDoc.slug}`);
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateJournal(doc?.slug);
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Real Estate', value: 'Real Estate' },
        { label: 'Lifestyle', value: 'Lifestyle' },
        { label: 'Mobility', value: 'Mobility' },
        { label: 'Events', value: 'Events' },
      ],
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
};
