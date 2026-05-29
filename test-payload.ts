import { getPayload } from 'payload';
import configPromise from './payload.config';

async function run() {
  const payload = await getPayload({ config: configPromise });
  const posts = await payload.find({
    collection: 'journal-posts',
    limit: 1,
  });
  console.log(JSON.stringify(posts.docs[0]?.content, null, 2));
}

run();
