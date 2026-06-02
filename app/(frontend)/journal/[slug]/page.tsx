import { getJournalPostBySlug, getJournalPosts } from '@/lib/journal';
import { notFound } from 'next/navigation';
import { FadeIn } from '@/components/FadeIn';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import {
  SITE_NAME,
  SITE_URL,
  OG_IMAGE,
  absoluteUrl,
  breadcrumbJsonLd,
} from '@/lib/seo';

export async function generateStaticParams() {
  const posts = await getJournalPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getJournalPostBySlug(resolvedParams.slug);
  if (!post) return { title: { absolute: 'Post Not Found | Novaren Lifestyle' } };

  const url = `/journal/${post.slug}`;
  const image = post.coverImage || OG_IMAGE.url;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
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
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [image],
    },
  };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getJournalPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : [OG_IMAGE.url],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    articleSection: post.category,
    inLanguage: 'en',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/journal/${post.slug}`),
    },
    author: post.author?.name
      ? { '@type': 'Person', name: post.author.name, jobTitle: post.author.role }
      : { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <article className="min-h-screen bg-sand text-forest pb-32">
      <JsonLd
        data={[
          blogPostingJsonLd,
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Journal', path: '/journal' },
            { name: post.title, path: `/journal/${post.slug}` },
          ]),
        ]}
      />
      {/* Hero Image Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full mt-24">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-sand to-transparent z-10" />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 -mt-32 relative z-20">
        <FadeIn>
          <div className="mb-12">
            <Link 
              href="/journal" 
              className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-forest/70 hover:text-gold transition-colors mb-8"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Journal
            </Link>

            <div className="flex items-center space-x-4 mb-6">
              <span className="bg-forest text-sand px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                {post.category}
              </span>
              <time className="text-xs font-medium uppercase tracking-widest text-gold" dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-tight mb-8">
              {post.title}
            </h1>

            <div className="flex items-center space-x-4 pb-8 border-b border-forest/10">
              {post.author?.avatarUrl && (
                <Image
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  unoptimized
                  className="w-12 h-12 rounded-full object-cover grayscale"
                />
              )}
              <div>
                <p className="font-semibold text-lg">{post.author.name}</p>
                <p className="text-sm text-forest/60 uppercase tracking-widest">{post.author.role}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="prose prose-lg md:prose-xl prose-stone max-w-none prose-headings:font-serif prose-headings:font-normal prose-headings:text-forest prose-p:text-forest/80 prose-p:font-light prose-p:leading-relaxed prose-a:text-gold hover:prose-a:text-forest transition-colors">
            <RichText data={post.content} />
          </div>
        </FadeIn>
      </div>
    </article>
  );
}
