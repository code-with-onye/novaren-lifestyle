import { getJournalPostBySlug, getJournalPosts } from '@/lib/journal';
import { notFound } from 'next/navigation';
import { FadeIn } from '@/components/FadeIn';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RichText } from '@payloadcms/richtext-lexical/react';

export async function generateStaticParams() {
  const posts = await getJournalPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getJournalPostBySlug(resolvedParams.slug);
  if (!post) return { title: 'Post Not Found | Novaren Lifestyle' };

  return {
    title: `${post.title} | Novaren Lifestyle`,
    description: post.excerpt,
  };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getJournalPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-sand text-forest pb-32">
      {/* Hero Image Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full mt-24">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
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
              <img 
                src={post.author.avatarUrl} 
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover grayscale"
              />
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
