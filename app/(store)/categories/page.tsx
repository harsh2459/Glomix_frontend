import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';
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

const PASTEL_GRADIENTS = [
  'from-rose-100 to-pink-50',
  'from-purple-100 to-violet-50',
  'from-amber-100 to-yellow-50',
  'from-teal-100 to-cyan-50',
  'from-blue-100 to-indigo-50',
  'from-green-100 to-emerald-50',
  'from-orange-100 to-red-50',
  'from-pink-100 to-fuchsia-50',
  'from-sky-100 to-blue-50',
  'from-lime-100 to-green-50',
];

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-gradient-to-br from-gray-50 to-rose-50/30 border-b border-gray-100">
        <div className="container py-14">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-gray-700 transition">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium">All Categories</span>
          </nav>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Shop by Category
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Explore our complete range of natural beauty products, from skincare to haircare and beyond.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {categories.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🌸</div>
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">Categories coming soon</h2>
            <p className="text-gray-500 mb-6">We&apos;re setting up our product categories. Check back soon!</p>
            <Link href="/products" className="btn-primary">Browse All Products</Link>
          </div>
        ) : (
          <>
            {/* Grid — 2 cols mobile, 3 md, 4 lg */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.map((cat, idx) => {
                const colorIdx = cat.name.charCodeAt(0) % PASTEL_GRADIENTS.length;
                return (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
                  >
                    {cat.image ? (
                      /* Has image — full bleed with gradient overlay */
                      <div className="aspect-square relative">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h2 className="font-heading text-lg font-bold text-white drop-shadow-lg leading-tight">
                            {cat.name}
                          </h2>
                          {cat.description && (
                            <p className="text-xs text-white/70 mt-1 line-clamp-1">{cat.description}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-white/80 font-medium mt-2">
                            Shop Now <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* No image — elegant pastel card */
                      <div className={`aspect-square bg-gradient-to-br ${PASTEL_GRADIENTS[colorIdx]} flex flex-col items-center justify-center p-6 text-center`}>
                        <div className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center mb-4 shadow-sm text-3xl group-hover:scale-110 transition-transform">
                          {cat.name[0]}
                        </div>
                        <h2 className="font-heading text-lg font-bold text-gray-800 leading-tight">{cat.name}</h2>
                        {cat.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{cat.description}</p>
                        )}
                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-600 group-hover:gap-2 transition-all">
                          Explore <ArrowRight size={12} />
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Browse all products CTA */}
            <div className="mt-14 rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-10 text-center">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-gray-400 mb-6">Browse our entire collection of natural beauty products</p>
              <Link href="/products" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition">
                Browse All Products <ArrowRight size={18} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
