import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import JsonLd from "@/components/JsonLd";
import { getJournalPosts, type JournalPost } from "@/lib/journal";
import { SITE_NAME, SITE_URL, absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";
import { formatPostDate } from "./format";

const description =
  "Editorial notes on living well in Abuja — stays, movement, dining, culture and the details that make a visit memorable.";

export const metadata: Metadata = {
  title: "Journal",
  description,
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "Journal",
    description,
    url: "/journal",
    type: "website",
  },
  twitter: { title: "Journal", description },
};

function PostMeta({ post }: { post: JournalPost }) {
  return (
    <div className="post-meta">
      <span>{post.category}</span>
      {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
    </div>
  );
}

function Author({ post }: { post: JournalPost }) {
  if (!post.author?.name) return null;
  return (
    <div className="post-author">
      {post.author.avatarUrl ? (
        <Image src={post.author.avatarUrl} alt="" width={36} height={36} unoptimized />
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
  );
}

export default async function JournalPage() {
  const posts = await getJournalPosts();
  const [featured, ...rest] = posts;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Journal`,
    description,
    url: absoluteUrl("/journal"),
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.slice(0, 20).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.publishedAt,
      url: absoluteUrl(`/journal/${post.slug}`),
      ...(post.coverImage ? { image: [post.coverImage] } : {}),
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          blogJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Journal", path: "/journal" },
          ]),
        ]}
      />

      <section className="journal-hero">
        <FadeIn className="section-head">
          <div className="eyebrow">The Novaren Journal</div>
          <h1>Notes on living well in Abuja.</h1>
          <p>
            Stays, movement, dining and culture — considered recommendations and the stories behind
            them.
          </p>
        </FadeIn>
      </section>

      <section className="section journal-list">
        <div className="container">
          {!featured ? (
            <p className="note">New stories are on the way. Check back soon.</p>
          ) : (
            <>
              <FadeIn>
                <Link href={`/journal/${featured.slug}`} className="post-featured">
                  <div className="post-featured-img">
                    {featured.coverImage && (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        priority
                        sizes="(max-width: 900px) 100vw, 58vw"
                      />
                    )}
                  </div>
                  <div className="post-featured-body">
                    <div className="eyebrow">Latest story</div>
                    <PostMeta post={featured} />
                    <h2>{featured.title}</h2>
                    <p>{featured.excerpt}</p>
                    <Author post={featured} />
                    <span className="text-link">Read the story ↗</span>
                  </div>
                </Link>
              </FadeIn>

              {rest.length > 0 && (
                <div className="post-grid">
                  {rest.map((post, i) => (
                    <FadeIn key={post.slug} delay={(i % 3) * 0.08}>
                      <Link href={`/journal/${post.slug}`} className="post-card">
                        <div className="post-card-img">
                          {post.coverImage && (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
                            />
                          )}
                        </div>
                        <PostMeta post={post} />
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <Author post={post} />
                      </Link>
                    </FadeIn>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="final-cta">
        <FadeIn>
          <div className="eyebrow">Planning a visit?</div>
          <h2>Let us take care of the details.</h2>
          <div className="actions">
            <Link className="btn" href="/#concierge">
              Start an enquiry <span className="arrow">↗</span>
            </Link>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
