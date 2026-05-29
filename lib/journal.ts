import { getPayload } from 'payload';
import configPromise from '@payload-config';

export type JournalAuthor = {
  name: string;
  role: string;
  avatarUrl: string;
};

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: any; // Lexical rich text JSON
  coverImage: any; // Can be string (URL) or Media object depending on populate
  category: string;
  author: JournalAuthor;
  publishedAt: string;
};

export async function getJournalPosts(): Promise<JournalPost[]> {
  const payload = await getPayload({ config: configPromise });
  const posts = await payload.find({
    collection: 'journal-posts',
    sort: '-publishedAt',
    limit: 100,
  });

  return posts.docs.map((doc: any) => ({
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImage: typeof doc.coverImage === 'object' && doc.coverImage?.url ? doc.coverImage.url : '',
    category: doc.category,
    author: doc.author,
    publishedAt: doc.publishedAt,
  }));
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  const payload = await getPayload({ config: configPromise });
  const posts = await payload.find({
    collection: 'journal-posts',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (!posts.docs.length) return null;

  const doc = posts.docs[0] as any;

  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImage: typeof doc.coverImage === 'object' && doc.coverImage?.url ? doc.coverImage.url : '',
    category: doc.category,
    author: doc.author,
    publishedAt: doc.publishedAt,
  };
}
