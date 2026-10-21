import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: dirname,
  },
  // The previous site's standalone pages now live as sections of the homepage.
  async redirects() {
    return [
      { source: "/lifestyle", destination: "/", permanent: true },
      { source: "/about", destination: "/", permanent: true },
      { source: "/approach", destination: "/", permanent: true },
      { source: "/services", destination: "/#services", permanent: true },
      { source: "/inquire", destination: "/#concierge", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default withPayload(nextConfig);
