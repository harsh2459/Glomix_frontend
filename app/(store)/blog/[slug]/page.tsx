import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight, Calendar, User, Tag,
  Facebook, Twitter, Link2, ArrowLeft,
  BookOpen,
} from 'lucide-react';
import ShareButtons from './ShareButtons';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

interface RelatedPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  publishedAt?: string;
  tags: string[];
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

async function getRelated(): Promise<RelatedPost[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog?page=1&limit=3`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const title = post.seo?.metaTitle || `${post.title} | Glomix Blog`;
  const description = post.seo?.metaDescription || post.excerpt || '';
  const image = post.seo?.ogImage || post.coverImage;

  return {
    title,
    description,
    keywords: post.seo?.keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: image ? [{ url: image, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, related] = await Promise.all([getPost(slug), getRelated()]);
  if (!post) notFound();

  const relatedFiltered = related.filter(r => r.slug !== slug).slice(0, 3);
  const readUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/blog/${slug}`;

  return (
    <div className="container section">
      <div className="max-w-3xl mx-auto">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <Link href="/blog" className="hover:text-gray-700 transition-colors">Blog</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-gray-700 truncate max-w-[240px]">{post.title}</span>
        </nav>

        {/* ── Tags ── */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map(tag => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="badge badge-primary text-xs hover:opacity-80 transition"
              >
                <Tag size={9} className="mr-0.5" />{tag}
              </Link>
            ))}
          </div>
        )}

        {/* ── Title ── */}
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-5" style={{ color: 'var(--color-primary)' }}>
          {post.title}
        </h1>

        {/* ── Excerpt ── */}
        {post.excerpt && (
          <p className="text-gray-500 text-lg leading-relaxed mb-6">{post.excerpt}</p>
        )}

        {/* ── Meta ── */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
          <span className="flex items-center gap-1.5 font-medium text-gray-600">
            <User size={13} />{post.author}
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />{formatDate(post.publishedAt)}
            </span>
          )}
          {/* Share — client component */}
          <ShareButtons
            url={readUrl}
            title={post.title}
            image={post.seo?.ogImage || post.coverImage}
          />
        </div>

        {/* ── Cover Image ── */}
        {post.coverImage && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* ── Rich Content ── */}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ── Bottom Share ── */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-500 mb-3">Enjoyed this article? Share it:</p>
          <ShareButtons
            url={readUrl}
            title={post.title}
            image={post.seo?.ogImage || post.coverImage}
            showLabel
          />
        </div>

        {/* ── Back link ── */}
        <div className="mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
      </div>

      {/* ── Related Posts ── */}
      {relatedFiltered.length > 0 && (
        <div className="mt-20 pt-16 border-t border-gray-100">
          <h2 className="font-heading text-2xl font-bold mb-8 text-center">More Articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedFiltered.map(rp => (
              <Link key={rp._id} href={`/blog/${rp.slug}`} className="group block">
                <article className="h-full flex flex-col rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                    {rp.coverImage
                      ? <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <BookOpen size={28} className="text-gray-200" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {rp.tags.slice(0, 2).map(t => (
                        <span key={t} className="badge badge-primary text-[11px]">{t}</span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity mb-2">
                      {rp.title}
                    </h3>
                    {rp.excerpt && (
                      <p className="text-gray-400 text-sm line-clamp-2">{rp.excerpt}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-3">{formatDate(rp.publishedAt)}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
