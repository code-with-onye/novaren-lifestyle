import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { FadeIn } from "@/components/FadeIn";
import JsonLd from "@/components/JsonLd";
import { getJournalPostBySlug, getJournalPostsSafe } from "@/lib/journal";
import { SITE_NAME, SITE_URL, OG_IMAGE, absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";
import { formatPostDate, readingMinutes } from "../format";

type Props = { params: Promise<{ slug: string }> };

// Re-render hourly as a safety net; editing a post in the CMS also revalidates immediately.
export const revalidate = 3600;

// If the CMS is unreachable at build time this returns no paths, and posts are
// rendered on their first request instead of failing the build.
export async function generateStaticParams() {
  const posts = await getJournalPostsSafe();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) return { title: { absolute: `Post Not Found | ${SITE_NAME}` } };

  const url = `/journal/${post.slug}`;
  const image = post.coverImage || OG_IMAGE.url;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      section: post.category,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [image],
    },
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getJournalPostBySlug(slug), getJournalPostsSafe()]);
  if (!post) notFound();

  const more = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const minutes = readingMinutes(post.content);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : [OG_IMAGE.url],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    articleSection: post.category,
    inLanguage: "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/journal/${post.slug}`),
    },
    author: post.author?.name
      ? { "@type": "Person", name: post.author.name, jobTitle: post.author.role }
      : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <article className="post">
      <JsonLd
        data={[
          blogPostingJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Editorial", path: "/journal" },
            { name: post.title, path: `/journal/${post.slug}` },
          ]),
        ]}
      />

      <header className="post-header">
        <FadeIn>
          <Link href="/journal" className="post-back">
            ← Back to Editorial
          </Link>
          <div className="post-meta">
            <span>{post.category}</span>
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
            <span>{minutes} min read</span>
          </div>
          <h1>{post.title}</h1>
          <p className="post-dek">{post.excerpt}</p>
          {post.author?.name && (
            <div className="post-author">
              {post.author.avatarUrl ? (
                <Image src={post.author.avatarUrl} alt="" width={44} height={44} unoptimized />
              ) : (
                <span className="post-author-initial" aria-hidden="true">
                  {post.author.name.charAt(0)}
                </span>
              )}
              <div>
                <strong>{post.author.name}</strong>
                {post.author.role && <small>{post.author.role}</small>}
              </div>
            </div>
          )}
        </FadeIn>
      </header>

      {post.coverImage && (
        <div className="post-cover">
          <Image src={post.coverImage} alt={post.title} fill priority sizes="(max-width: 1200px) 100vw, 1200px" />
        </div>
      )}

      <FadeIn delay={0.1}>
        <div className="post-body">
          {post.content ? <RichText data={post.content} /> : <p>{post.excerpt}</p>}
        </div>
      </FadeIn>

      <aside className="post-enquire">
        <div className="eyebrow">Inspired to visit?</div>
        <h2>We can arrange the stay, the ride and the reservations.</h2>
        <div className="actions">
          <Link className="btn" href="/#concierge">
            Request a concierge <span className="arrow">↗</span>
          </Link>
          <Link className="btn light" href="/journal">
            More stories
          </Link>
        </div>
      </aside>

      {more.length > 0 && (
        <section className="section post-more" aria-labelledby="more-heading">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Keep reading</div>
              <h2 id="more-heading">More from Editorial</h2>
            </div>
            <div className="post-grid">
              {more.map((p) => (
                <Link key={p.slug} href={`/journal/${p.slug}`} className="post-card">
                  <div className="post-card-img">
                    {p.coverImage && (
                      <Image src={p.coverImage} alt={p.title} fill sizes="(max-width: 700px) 100vw, 33vw" />
                    )}
                  </div>
                  <div className="post-meta">
                    <span>{p.category}</span>
                    {p.publishedAt && <time dateTime={p.publishedAt}>{formatPostDate(p.publishedAt)}</time>}
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
