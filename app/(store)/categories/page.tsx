import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package } from 'lucide-react';
import { ICategory } from '../../../types';

export const metadata: Metadata = {
  title: 'All Categories — Shop Natural Beauty',
  description: 'Explore all our natural beauty and skincare product categories.',
};

async function getCategories(): Promise<ICategory[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, {
      next: { revalidate: 300 },
    });
    return (await res.json()).data ?? [];
  } catch { return []; }
}

async function getCategoryProductCount(categoryId: string): Promise<number> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?category=${categoryId}&limit=1`,
      { next: { revalidate: 300 } }
    );
    return (await res.json()).pagination?.total ?? 0;
  } catch { return 0; }
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  const counts = await Promise.all(categories.map(c => getCategoryProductCount(c._id)));
  const catWithCount = categories.map((c, i) => ({ ...c, productCount: counts[i] }));
  const totalProducts = catWithCount.reduce((s, c) => s + c.productCount, 0);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>

      {/* ── Page header — no border ───────────────────────── */}
      <div style={{ background: '#fafaf8' }}>
        <div className="container py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: '#0a0a0a' }}>
            Explore
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3"
            style={{ color: '#0a0a0a' }}>
            Shop by Category
          </h1>
          <p className="text-base max-w-lg" style={{ color: '#b0a99e' }}>
            {categories.length} categories &nbsp;·&nbsp; {totalProducts} products — natural beauty for every concern
          </p>
        </div>
      </div>

      {/* ── Category grid ────────────────────────────────── */}
      <div className="container py-10 pb-16">
        {categories.length === 0 ? (
          <div className="text-center py-32">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <h2 className="font-heading text-2xl font-bold mb-2"
              style={{ color: '#0a0a0a' }}>
              Categories coming soon
            </h2>
            <p className="mb-8" style={{ color: '#b0a99e' }}>
              We&apos;re setting things up. Check back soon!
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl"
              style={{ background: '#0a0a0a', color: '#fff' }}>
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            {/* 4-col image-overlay cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {catWithCount.map(cat => (
                <CategoryCard key={cat._id} cat={cat} />
              ))}
            </div>

            {/* ── Bottom CTA — light, clean ─────────────────── */}
            <div
              className="mt-14 rounded-3xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
              style={{ background: '#f4f1ec' }}
            >
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: '#0a0a0a' }}>
                  Can&apos;t find what you&apos;re looking for?
                </h2>
                <p className="text-sm" style={{ color: '#b0a99e' }}>
                  Browse our full collection — filter by price, rating, category and more.
                </p>
              </div>
              <Link
                href="/products"
                className="shrink-0 inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-2xl transition-all hover:opacity-90 hover:scale-[1.02] whitespace-nowrap"
                style={{ background: '#0a0a0a', color: '#fff' }}
              >
                All Products <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Image-overlay card — name + description + CTA over image ─
function CategoryCard({ cat }: { cat: ICategory & { productCount: number } }) {
  return (
    <Link
      href={`/category/${cat.slug}`}
      className="group relative block rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
      style={{ aspectRatio: '3/4' }}
    >
      {/* Background image or gradient fallback */}
      {cat.image ? (
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #4a453f 100%)',
          }}
        />
      )}

      {/* Always-on bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* Product count — top right */}
      <div className="absolute top-3 right-3">
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(6px)' }}
        >
          {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Bottom content — always visible, lifts on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h2 className="font-heading text-xl font-bold text-white leading-tight mb-1">
          {cat.name}
        </h2>
        {cat.description && (
          <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-3 max-w-[220px]">
            {cat.description}
          </p>
        )}
        <div
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-300 group-hover:gap-2.5"
          style={{ background: '#0a0a0a', color: '#fff' }}
        >
          Shop Now <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}
