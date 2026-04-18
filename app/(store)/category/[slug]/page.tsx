import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, SlidersHorizontal, ArrowRight } from 'lucide-react';
import ProductCard from '../../../../components/products/ProductCard';
import { ICategory, IProduct } from '../../../../types';

interface Props { params: Promise<{ slug: string }> }

async function getCategory(slug: string): Promise<ICategory | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, { next: { revalidate: 300 } });
    const cats: ICategory[] = (await res.json()).data ?? [];
    return cats.find(c => c.slug === slug) ?? null;
  } catch { return null; }
}

async function getCategoryProducts(categoryId: string): Promise<IProduct[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?category=${categoryId}&limit=48`, { next: { revalidate: 120 } });
    return (await res.json()).data ?? [];
  } catch { return []; }
}

async function getAllCategories(): Promise<ICategory[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, { next: { revalidate: 300 } });
    return (await res.json()).data ?? [];
  } catch { return []; }
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: category.seo?.metaTitle || `${category.name} — Shop Natural Beauty`,
    description: category.seo?.metaDescription || category.description || `Shop ${category.name} products at Glomix.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([getCategory(slug), getAllCategories()]);
  if (!category) notFound();

  const products = await getCategoryProducts(category._id);

  const featured = products.filter(p => p.isFeatured).slice(0, 1)[0] ?? null;
  const onSale   = products.filter(p => p.salePrice && p.salePrice < p.price).length;

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
        {/* Background image */}
        {category.image ? (
          <div className="absolute inset-0">
            <Image src={category.image} alt={category.name} fill className="object-cover" priority sizes="100vw" />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: '#0a0a0a' }} />
        )}

        {/* Strong dark scrim so text is always readable over any image */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.18) 100%)' }} />

        <div className="container relative flex flex-col justify-end" style={{ minHeight: 380, paddingBottom: '2.5rem', paddingTop: '2rem' }}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-medium mb-5 flex-wrap" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            <ChevronRight size={12} />
            <span style={{ color: '#fff' }}>{category.name}</span>
          </nav>

          <h1 className="font-heading font-bold text-white mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.35)' }}>
            {category.name}
          </h1>
          {category.description && (
            <p className="mb-5 max-w-xl" style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1rem', lineHeight: 1.6, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
              {category.description}
            </p>
          )}

          {/* Stats chips */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatChip value={products.length} label={products.length === 1 ? 'Product' : 'Products'} />
            {onSale > 0 && <StatChip value={onSale} label="On Sale" accent />}
            {featured && <StatChip value="Featured" label="Available" />}
          </div>
        </div>
      </div>

      {/* ── Category pill nav ────────────────────────────────── */}
      {allCategories.length > 1 && (
        <div className="sticky top-0 z-20" style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div className="container">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              <Link
                href="/products"
                className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap hover:border-gray-400"
                style={{ background: '#fff', borderColor: '#e5e7eb', color: '#374151' }}
              >
                <SlidersHorizontal size={12} />
                All Products
              </Link>
              {allCategories.map(cat => {
                const active = cat.slug === slug;
                return (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap"
                    style={active ? {
                      background: '#0a0a0a',
                      borderColor: '#0a0a0a',
                      color: '#fff',
                    } : {
                      background: '#fff',
                      borderColor: '#e5e7eb',
                      color: '#374151',
                    }}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Products grid ────────────────────────────────────── */}
      <div className="container py-10">
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Section header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl font-bold" style={{ color: '#0a0a0a' }}>
                  {category.name}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#b0a99e' }}>
                  {products.length} product{products.length !== 1 ? 's' : ''} available
                </p>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: '#0a0a0a' }}
              >
                All Products <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid-products">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Other categories strip ───────────────────────────── */}
      {allCategories.length > 1 && (
        <div
          className="border-t py-12"
          style={{ borderColor: '#f4f1ec', background: '#f4f1ec' }}
        >
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold" style={{ color: '#0a0a0a' }}>
                Other Categories
              </h3>
              <Link
                href="/categories"
                className="text-sm font-medium transition-opacity hover:opacity-70 flex items-center gap-1"
                style={{ color: '#0a0a0a' }}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {allCategories.filter(c => c.slug !== slug).map(cat => (
                <Link
                  key={cat._id}
                  href={`/category/${cat.slug}`}
                  className="shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md group"
                  style={{ background: '#fafaf8', borderColor: '#f4f1ec', minWidth: 90 }}
                >
                  <span className="text-xs font-semibold text-center leading-tight" style={{ color: '#0a0a0a' }}>
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatChip({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={{
        background: accent ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.15)',
        border: `1px solid ${accent ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.25)'}`,
        color: accent ? '#fbbf24' : '#fff',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className="font-bold">{value}</span>
      <span style={{ opacity: 0.75 }}>{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-28">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6"
        style={{ background: '#f4f1ec' }}
      >
        🌿
      </div>
      <h2 className="font-heading text-2xl font-bold mb-2" style={{ color: '#0a0a0a' }}>
        Coming Soon
      </h2>
      <p className="mb-8 max-w-sm mx-auto" style={{ color: '#b0a99e' }}>
        We&apos;re adding products to this category. Check back soon!
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-opacity hover:opacity-90"
        style={{ background: '#0a0a0a', color: '#fff' }}
      >
        Browse All Products <ArrowRight size={16} />
      </Link>
    </div>
  );
}
