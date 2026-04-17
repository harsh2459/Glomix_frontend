import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, Tag, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Glomix Beauty',
  description: 'Tips, guides and expert advice on skincare, beauty and wellness from the Glomix team.',
};

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  tags: string[];
  publishedAt?: string;
}

interface BlogResponse {
  success: boolean;
  data: BlogPost[];
  pagination: { page: number; total: number; pages: number };
}

async function getPosts(page = 1): Promise<BlogResponse | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog?page=${page}&limit=9`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');
  const data = await getPosts(page);
  const posts = data?.data ?? [];
  const totalPages = data?.pagination?.pages ?? 1;

  return (
    <div className="container section">

      {/* Page header */}
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          <BookOpen size={13} /> Our Blog
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          Beauty Insights &amp; Skincare Tips
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
          Expert advice, ingredient deep-dives and routines curated by the Glomix team for radiant, healthy skin.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">No articles published yet. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Featured first post */}
          {posts.length > 0 && page === 1 && (
            <Link href={`/blog/${posts[0].slug}`} className="block mb-12 group">
              <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-[16/9] md:aspect-auto bg-gray-100 overflow-hidden">
                  {posts[0].coverImage
                    ? <img src={posts[0].coverImage} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <BookOpen size={48} className="text-gray-300" />
                      </div>
                  }
                  <div className="absolute top-4 left-4">
                    <span className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full">Featured</span>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {posts[0].tags.slice(0, 3).map(tag => (
                      <span key={tag} className="badge badge-primary text-xs">{tag}</span>
                    ))}
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 group-hover:opacity-70 transition-opacity leading-snug">
                    {posts[0].title}
                  </h2>
                  {posts[0].excerpt && (
                    <p className="text-gray-500 text-base leading-relaxed mb-6 line-clamp-3">{posts[0].excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                    <span className="flex items-center gap-1"><User size={11} />{posts[0].author}</span>
                    {posts[0].publishedAt && (
                      <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(posts[0].publishedAt)}</span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    Read Article <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Grid of remaining posts */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {(page === 1 ? posts.slice(1) : posts).map(post => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="group block">
                <article className="h-full flex flex-col rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  {/* Cover */}
                  <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                    {post.coverImage
                      ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <BookOpen size={32} className="text-gray-200" />
                        </div>
                    }
                  </div>

                  {/* Body */}
                  <div className="flex-1 flex flex-col p-5">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="badge badge-primary text-[11px]">{tag}</span>
                      ))}
                    </div>

                    <h2 className="font-heading text-lg font-bold mb-2 leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User size={10} />{post.author}</span>
                        {post.publishedAt && (
                          <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(post.publishedAt)}</span>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 group-hover:text-gray-700 transition-all" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {page > 1 && (
                <Link
                  href={`/blog?page=${page - 1}`}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
                >
                  ← Previous
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/blog?page=${p}`}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                    p === page
                      ? 'border-transparent text-white'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                  style={p === page ? { backgroundColor: 'var(--color-primary)' } : undefined}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
