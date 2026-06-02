import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getJournalPosts } from "@/lib/journal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/approach", priority: 0.7, changeFrequency: "monthly" },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/journal", priority: 0.7, changeFrequency: "weekly" },
    { path: "/inquire", priority: 0.6, changeFrequency: "yearly" },
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

  return [...staticRoutes, ...journalRoutes];
}
