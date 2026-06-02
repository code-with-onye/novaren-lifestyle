import { v2 as cloudinary } from 'cloudinary';
import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const folder = process.env.CLOUDINARY_FOLDER || 'novaren';

// Cloudinary public_ids exclude the file extension; the delivered URL re-appends it.
const stripExt = (filename: string) => filename.replace(/\.[^./]+$/, '');
const publicId = (filename: string) => `${folder}/${stripExt(filename)}`;

const deliveryUrl = (filename: string) =>
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${folder}/${filename}`;

export const cloudinaryStorage: Adapter = (): GeneratedAdapter => ({
  name: 'cloudinary',

  handleUpload: async ({ file }) =>
    new Promise<void>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId(file.filename),
          resource_type: 'image',
          overwrite: true,
          invalidate: true,
          // We let Payload generate image sizes (sharp); each arrives as its own file.
          use_filename: false,
          unique_filename: false,
        },
        (error) => {
          if (error) reject(error);
          else resolve();
        },
      );
      stream.end(file.buffer);
    }),

  handleDelete: async ({ filename }) => {
    await cloudinary.uploader.destroy(publicId(filename), {
      resource_type: 'image',
      invalidate: true,
    });
  },

  generateURL: ({ filename }) => deliveryUrl(filename),

  // Fallback for any direct file request — redirect to the Cloudinary CDN.
  staticHandler: (_req, { params: { filename } }) =>
    Response.redirect(deliveryUrl(filename), 302),
});
