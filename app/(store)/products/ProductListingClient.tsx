'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import ProductCard from '../../../components/products/ProductCard';
import { IProduct, ICategory, PaginatedResponse } from '../../../types';
import api from '../../../lib/api';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'bestsellers', label: 'Best Sellers' },
  { value: 'new', label: 'Newest First' },
];

export default function ProductListingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get('page') ?? '1');
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? '';
  const search = searchParams.get('q') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', String(page));
    params.set('limit', '12');

    setLoading(true);
    api.get<{ data: IProduct[]; pagination: PaginatedResponse<IProduct>['pagination'] }>(`/products?${params}`)
      .then((res) => {
        setProducts(res.data.data ?? []);
        setTotal(res.data.pagination?.total ?? 0);
        setPages(res.data.pagination?.pages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page, category, sort, search, minPrice, maxPrice]);

  useEffect(() => {
    api.get<{ data: ICategory[] }>('/products/categories').then((res) => setCategories(res.data.data ?? []));
  }, []);

  const hasFilters = !!(category || sort || minPrice || maxPrice);

  return (
    <div className="flex gap-8">
      {/* Filters sidebar desktop */}
      <aside className={`shrink-0 w-56 hidden lg:block space-y-6`}>
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">Category</h3>
          <ul className="space-y-2">
            <li>
              <button onClick={() => updateParam('category', '')} className={`text-sm ${!category ? 'text-gray-500 font-semibold' : 'text-gray-400 hover:text-gray-900'}`}>
                All Products
              </button>
            </li>
            {categories.map((c) => (
              <li key={c._id}>
                <button onClick={() => updateParam('category', c._id)} className={`text-sm ${category === c._id ? 'text-gray-500 font-semibold' : 'text-gray-400 hover:text-gray-900'}`}>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">Price Range</h3>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} className="input text-sm py-1.5 w-20" min="0" />
            <span className="text-gray-500">–</span>
            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} className="input text-sm py-1.5 w-20" min="0" />
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <p className="text-sm text-gray-400 shrink-0">
            {loading ? 'Loading...' : `${total} Products`}
            {hasFilters && (
              <button onClick={() => router.push('/products')} className="ml-2 text-gray-600 hover:text-gray-500 inline-flex items-center gap-1 text-xs">
                <X size={12} /> Clear filters
              </button>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="btn-outline py-1.5 px-4 text-sm gap-2 lg:hidden">
              <SlidersHorizontal size={14} /> Filters
            </button>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="input py-1.5 text-sm w-44">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Search query */}
        {search && <p className="mb-4 text-sm text-gray-400">Showing results for: <strong className="text-gray-900">"{search}"</strong></p>}

        {/* Products Grid */}
        {loading ? (
          <div className="grid-products">
            {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton rounded-2xl aspect-product" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-semibold mb-2">No products found</p>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search term</p>
            <button onClick={() => router.push('/products')} className="btn-primary">Browse All Products</button>
          </div>
        ) : (
          <div className="grid-products">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => updateParam('page', String(i + 1))}
                className={`w-9 h-9 rounded-lg text-sm font-medium ${page === i + 1 ? 'btn-primary' : 'btn-ghost border border-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
