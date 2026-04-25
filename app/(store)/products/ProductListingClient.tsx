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
    if (key !== 'page') params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  useEffect(() => {
    api.get<{ data: ICategory[] }>('/products/categories').then(res => setCategories(res.data.data ?? []));
  }, []);

  useEffect(() => {
    if (category && categories.length === 0) return;

    const params = new URLSearchParams();
    if (search)   params.set('search', search);
    if (sort)     params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', String(page));
    params.set('limit', '12');

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

  const inputStyle: React.CSSProperties = {
    width: 80,
    padding: '7px 10px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 13,
    color: 'var(--text)',
    background: 'var(--bg)',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 56, alignItems: 'start' }}>

      {/* Sidebar */}
      <aside className="hidden lg:block" style={{ position: 'sticky', top: 96 }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12, fontWeight: 500 }}>
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
                      borderRadius: 'var(--radius)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      background: active ? 'var(--bg-alt)' : 'transparent',
                      color: active ? 'var(--text)' : 'var(--text-sub)',
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

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12, fontWeight: 500 }}>
            Price Range
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="number" placeholder="₹ Min" value={minPrice}
              onChange={e => updateParam('minPrice', e.target.value)}
              style={inputStyle}
              min="0"
            />
            <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>—</span>
            <input
              type="number" placeholder="₹ Max" value={maxPrice}
              onChange={e => updateParam('maxPrice', e.target.value)}
              style={inputStyle}
              min="0"
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={() => router.push('/products')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--error)', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 'var(--radius)', padding: '7px 12px', cursor: 'pointer', width: '100%', justifyContent: 'center', fontFamily: 'inherit' }}
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </aside>

      {/* Main */}
      <main>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
            {loading ? 'Loading…' : (
              <><strong style={{ color: 'var(--text)', fontWeight: 500 }}>{total}</strong> Products</>
            )}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sort</span>
            <div style={{ position: 'relative' }}>
              <select
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '7px 32px 7px 12px',
                  fontSize: 13,
                  color: 'var(--text)',
                  background: 'var(--bg)',
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
                  padding: '5px 14px', borderRadius: 'var(--radius-pill)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  border: '1px solid',
                  borderColor: active ? 'var(--ink)' : 'var(--border)',
                  background: active ? 'var(--ink)' : 'var(--bg)',
                  color: active ? 'var(--ink-text)' : 'var(--text-sub)',
                  transition: 'all 0.15s',
                }}>
                {c.name}
              </button>
            );
          })}
        </div>

        {search && (
          <p style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-faint)' }}>
            Results for: <strong style={{ color: 'var(--text)' }}>"{search}"</strong>
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid-products">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '1/1' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>No products found</p>
            <p style={{ color: 'var(--text-faint)', marginBottom: 20 }}>Try adjusting your filters</p>
            <button onClick={() => router.push('/products')} className="btn-primary">
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
                  borderColor: page === i + 1 ? 'var(--ink)' : 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                  fontWeight: 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: page === i + 1 ? 'var(--ink)' : 'var(--bg)',
                  color: page === i + 1 ? 'var(--ink-text)' : 'var(--text-sub)',
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
