import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getJournalPosts } from "@/lib/journal";
import { getPublishedApartments } from "@/lib/bookings";
import { staysEnabled } from "@/lib/features";

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

  // Stays pages are only listed once online booking is switched on.
  // getPublishedApartments already returns [] if the CMS is unreachable.
  const stays = staysEnabled() ? await getPublishedApartments() : [];
  const stayRoutes: MetadataRoute.Sitemap = stays.map((a) => ({
    url: `${SITE_URL}/stays/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const visibleStatic = staysEnabled() ? staticRoutes : staticRoutes.filter((r) => !r.url.endsWith("/stays"));
  return [...visibleStatic, ...stayRoutes, ...journalRoutes];
}
