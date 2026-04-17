import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
  const [category, allCategories] = await Promise.all([
    getCategory(slug),
    getAllCategories(),
  ]);

  if (!category) notFound();

  // Fetch products by category ID (not slug, as backend filters by ObjectId)
  const products = await getCategoryProducts(category._id);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100">
        {category.image && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover opacity-10" />
          </div>
        )}
        <div className="container relative py-14">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-800 transition">Home</Link>
            <ChevronRight size={12} />
            <Link href="/products" className="hover:text-gray-800 transition">Products</Link>
            <ChevronRight size={12} />
            <span className="text-gray-800 font-medium">{category.name}</span>
          </nav>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-3">{category.name}</h1>
          {category.description && (
            <p className="text-gray-500 text-lg max-w-2xl">{category.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-3">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container py-10">
        {/* Related categories */}
        {allCategories.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <Link href="/products" className="px-4 py-1.5 rounded-full text-sm border border-gray-200 text-gray-500 hover:border-gray-800 hover:text-gray-800 transition">
              All Products
            </Link>
            {allCategories.map(cat => (
              <Link
                key={cat._id}
                href={`/category/${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                  cat.slug === slug
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-800 hover:text-gray-800'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🌿</div>
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
            <p className="text-gray-500 mb-6">We&apos;re adding products to this category. Check back soon!</p>
            <Link href="/products" className="btn-primary">Browse All Products</Link>
          </div>
        ) : (
          <div className="grid-products">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
