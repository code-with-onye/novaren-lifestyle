import { getJournalPosts } from '@/lib/journal';
import Link from 'next/link';
import { FadeIn } from '@/components/FadeIn';

export const metadata = {
  title: 'Journal | Novaren Lifestyle',
  description: 'Editorial insights, luxury real estate trends, and the lifestyle of the global Nigerian.',
};

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-sand text-forest">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <header className="mb-20 md:mb-32 max-w-3xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-6">
              The <em className="italic text-forest-light">Journal.</em>
            </h1>
            <p className="text-lg md:text-xl text-forest/80 font-light leading-relaxed">
              Curated insights on luxury living, premier real estate, and navigating Abuja with uncompromising style.
            </p>
          </header>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {posts.map((post, index) => (
            <FadeIn key={post.slug} delay={index * 0.15}>
              <Link href={`/journal/${post.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-forest/5">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-sand px-3 py-1 text-xs font-semibold uppercase tracking-widest text-forest">
                    {post.category}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-xs font-medium uppercase tracking-widest text-gold">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-serif leading-tight group-hover:text-gold transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-forest/70 font-light line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center space-x-3 pt-4 border-t border-forest/10 mt-6">
                    <img 
                      src={post.author.avatarUrl} 
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover grayscale"
                    />
                    <div>
                      <p className="text-sm font-semibold">{post.author.name}</p>
                      <p className="text-xs text-forest/60 uppercase tracking-widest">{post.author.role}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
