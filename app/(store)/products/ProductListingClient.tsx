'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
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

  const [products, setProducts]     = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [pages, setPages]           = useState(1);

  const page     = parseInt(searchParams.get('page') ?? '1');
  const category = searchParams.get('category') ?? '';
  const sort     = searchParams.get('sort') ?? '';
  const search   = searchParams.get('q') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    // Only reset to page 1 when changing filters, not when changing page itself
    if (key !== 'page') params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  // Load categories first, then products
  useEffect(() => {
    api.get<{ data: ICategory[] }>('/products/categories').then(res => setCategories(res.data.data ?? []));
  }, []);

  useEffect(() => {
    // If a category filter is active but categories haven't loaded yet, wait
    if (category && categories.length === 0) return;

    const params = new URLSearchParams();
    if (search)   params.set('search', search);
    if (sort)     params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', String(page));
    params.set('limit', '12');

    // Resolve slug OR _id → always send _id to the API
    if (category) {
      const found = categories.find(c => c._id === category || c.slug === category);
      params.set('category', found ? found._id : category);
    }

    setLoading(true);
    api.get<{ data: IProduct[]; pagination: PaginatedResponse<IProduct>['pagination'] }>(`/products?${params}`)
      .then(res => {
        setProducts(res.data.data ?? []);
        setTotal(res.data.pagination?.total ?? 0);
        setPages(res.data.pagination?.pages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page, category, sort, search, minPrice, maxPrice, categories]);

  const hasFilters = !!(category || sort || minPrice || maxPrice);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 56, alignItems: 'start' }}>

      {/* ── Sidebar ── */}
      <aside className="hidden lg:block" style={{ position: 'sticky', top: 96 }}>

        {/* Categories */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b0a99e', marginBottom: 12, fontWeight: 500 }}>
            Category
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[{ _id: '', name: 'All Products', slug: '' } as ICategory & { slug: string }, ...categories].map(c => {
              const active = c._id === '' ? !category : (category === c._id || category === c.slug);
              return (
                <li key={c._id} style={{ marginBottom: 2 }}>
                  <button
                    onClick={() => updateParam('category', c.slug || c._id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      background: active ? '#f4f1ec' : 'transparent',
                      color: active ? '#0a0a0a' : '#4a453f',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{c.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ height: 1, background: '#e8e4dd', marginBottom: 28 }} />

        {/* Price range */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b0a99e', marginBottom: 12, fontWeight: 500 }}>
            Price Range
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number" placeholder="₹ Min" value={minPrice}
              onChange={e => updateParam('minPrice', e.target.value)}
              style={{ width: 80, padding: '7px 10px', border: '1px solid #e8e4dd', borderRadius: 6, fontSize: 13, color: '#0a0a0a', background: '#fafaf8', outline: 'none', fontFamily: 'inherit' }}
              min="0"
            />
            <span style={{ color: '#b0a99e', fontSize: 12 }}>—</span>
            <input
              type="number" placeholder="₹ Max" value={maxPrice}
              onChange={e => updateParam('maxPrice', e.target.value)}
              style={{ width: 80, padding: '7px 10px', border: '1px solid #e8e4dd', borderRadius: 6, fontSize: 13, color: '#0a0a0a', background: '#fafaf8', outline: 'none', fontFamily: 'inherit' }}
              min="0"
            />
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => router.push('/products')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#c1392b', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </aside>

      {/* ── Main ── */}
      <main>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid #e8e4dd' }}>
          <p style={{ fontSize: 13, color: '#b0a99e' }}>
            {loading ? 'Loading…' : (
              <><strong style={{ color: '#0a0a0a', fontWeight: 500 }}>{total}</strong> Products</>
            )}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#b0a99e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sort</span>
            <div style={{ position: 'relative' }}>
              <select
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
                style={{
                  border: '1px solid #e8e4dd',
                  borderRadius: 6,
                  padding: '7px 32px 7px 12px',
                  fontSize: 13,
                  color: '#0a0a0a',
                  background: '#fafaf8',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  fontFamily: 'inherit',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23b0a99e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile category pills */}
        <div className="lg:hidden flex gap-2 flex-wrap mb-5">
          {[{ _id: '', name: 'All', slug: '' } as ICategory & { slug: string }, ...categories].map(c => {
            const active = c._id === '' ? !category : (category === c._id || category === c.slug);
            return (
              <button key={c._id} onClick={() => updateParam('category', c.slug || c._id)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  border: '1px solid',
                  borderColor: active ? '#0a0a0a' : '#e8e4dd',
                  background: active ? '#0a0a0a' : '#fafaf8',
                  color: active ? '#fafaf8' : '#4a453f',
                  transition: 'all 0.15s',
                }}>
                {c.name}
              </button>
            );
          })}
        </div>

        {search && (
          <p style={{ marginBottom: 16, fontSize: 13, color: '#b0a99e' }}>
            Results for: <strong style={{ color: '#0a0a0a' }}>"{search}"</strong>
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid-products">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="rounded-xl" style={{ aspectRatio: '1/1', background: '#f4f1ec' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 18, fontWeight: 500, color: '#0a0a0a', marginBottom: 8 }}>No products found</p>
            <p style={{ color: '#b0a99e', marginBottom: 20 }}>Try adjusting your filters</p>
            <button onClick={() => router.push('/products')}
              style={{ background: '#0a0a0a', color: '#fafaf8', border: 'none', borderRadius: 8, padding: '11px 28px', fontSize: 13, fontWeight: 500, cursor: 'pointer', letterSpacing: '0.04em' }}>
              Browse All
            </button>
          </div>
        ) : (
          <div className="grid-products">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 52 }}>
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => updateParam('page', String(i + 1))}
                style={{
                  width: 40, height: 40,
                  border: '1px solid',
                  borderColor: page === i + 1 ? '#0a0a0a' : '#e8e4dd',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: page === i + 1 ? '#0a0a0a' : '#fafaf8',
                  color: page === i + 1 ? '#fafaf8' : '#4a453f',
                  transition: 'all 0.15s',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
