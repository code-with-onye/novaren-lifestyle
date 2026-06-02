import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

import { cloudinaryStorage } from './storage/cloudinary';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { JournalPosts } from './collections/JournalPosts';
import { Inquiries } from './collections/Inquiries';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, JournalPosts, Inquiries],
  editor: lexicalEditor(),
  sharp,
  plugins: [
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryStorage,
          disableLocalStorage: true,
          // Serve files straight from the Cloudinary CDN via generateURL.
          disablePayloadAccessControl: true,
        },
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'super-secret-key-for-local-dev-only',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.db',
      // Required for remote libSQL/Turso (ignored for local file: URLs)
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),
});
