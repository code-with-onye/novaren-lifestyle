import { getPayload } from 'payload';
import configPromise from '@payload-config';

export type JournalAuthor = {
  name: string;
  role: string;
  avatarUrl: string;
};

// Payload nests the avatar upload inside the author group. When populated it is
// a Media object; flatten it to a plain URL so the frontend can render it directly.
function mapAuthor(author: any): JournalAuthor {
  return {
    name: author?.name ?? '',
    role: author?.role ?? '',
    avatarUrl:
      typeof author?.avatar === 'object' && author.avatar?.url ? author.avatar.url : '',
  };
}

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
    author: mapAuthor(doc.author),
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
    author: mapAuthor(doc.author),
    publishedAt: doc.publishedAt,
  };
}
