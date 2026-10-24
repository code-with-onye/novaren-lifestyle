import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getJournalPosts } from "@/lib/journal";
import { getPublishedApartments } from "@/lib/bookings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/stays", priority: 0.9, changeFrequency: "daily" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/journal", priority: 0.7, changeFrequency: "weekly" },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: r.priority,
  }));

  let journalRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getJournalPosts();
    journalRoutes = posts.map((post) => ({
      url: `${SITE_URL}/journal/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // If the CMS is unreachable at build time, still emit the static sitemap.
    journalRoutes = [];
  }

  // getPublishedApartments already returns [] if the CMS is unreachable.
  const stayRoutes: MetadataRoute.Sitemap = (await getPublishedApartments()).map((a) => ({
    url: `${SITE_URL}/stays/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...stayRoutes, ...journalRoutes];
}
