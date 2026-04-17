import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageData {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  updatedAt: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
}

async function getPage(slug: string): Promise<PageData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pages/${slug}`,
      { next: { revalidate: 300 } } // revalidate every 5 min
    );
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

// Generate SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: 'Page Not Found' };

  const title = page.seo?.metaTitle || `${page.title} | Glomix`;
  const description = page.seo?.metaDescription || page.excerpt || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: page.seo?.ogImage ? [page.seo.ogImage] : [],
    },
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Don't intercept known routes
  const EXCLUDED_SLUGS = ['products', 'blog', 'cart', 'checkout', 'account', 'login', 'register', 'orders', 'wishlist'];
  if (EXCLUDED_SLUGS.includes(slug)) notFound();

  const page = await getPage(slug);
  if (!page) notFound();

  const updatedDate = new Date(page.updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container section">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-gray-800 transition-colors">Home</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-800">{page.title}</span>
      </nav>

      {/* Page content */}
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{page.title}</h1>
          {page.excerpt && <p className="text-gray-500 text-lg">{page.excerpt}</p>}
          <p className="text-xs text-gray-400 mt-4">Last updated: {updatedDate}</p>
        </header>

        {/* Rendered HTML content */}
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
