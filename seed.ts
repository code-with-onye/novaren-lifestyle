import { getPayload } from 'payload';
import configPromise from './payload.config';

async function seed() {
  const payload = await getPayload({ config: configPromise });

  // Dummy data
  const MOCK_JOURNAL_POSTS = [
    {
      slug: 'the-rise-of-abuja-luxury-real-estate',
      title: 'The Rise of Abuja’s Luxury Real Estate Market',
      excerpt: 'An insider look into why Abuja is fast becoming the premier destination for high-end residential investments in West Africa.',
      content: {
        root: {
          type: "root",
          format: "",
          indent: 0,
          version: 1,
          children: [
            {
              type: "paragraph",
              format: "",
              indent: 0,
              version: 1,
              children: [
                {
                  mode: "normal",
                  text: "Abuja has long been known as the political center of Nigeria, but over the last decade, it has quietly transformed into something else entirely: a haven for luxury real estate and premium lifestyle experiences.",
                  type: "text",
                  style: "",
                  detail: 0,
                  format: 0,
                  version: 1
                }
              ]
            }
          ]
        }
      },
      category: 'Real Estate',
      author: {
        name: 'Onye',
        role: 'Head of Real Estate',
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80'
      },
      publishedAt: '2026-05-15T10:00:00.000Z'
    }
  ];

  for (const post of MOCK_JOURNAL_POSTS) {
    try {
      await payload.create({
        collection: 'journal-posts',
        data: post,
      });
      console.log(`Created: ${post.title}`);
    } catch (err) {
      console.error(`Failed to create ${post.title}`, err);
    }
  }
}

seed();
