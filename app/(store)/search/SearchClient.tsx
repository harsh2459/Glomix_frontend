'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import ProductCard from '../../../components/products/ProductCard';
import { IProduct } from '../../../types';
import { apiGet } from '../../../lib/api';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const [results, setResults] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(query);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setInputValue(query);
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(false);
    apiGet<{ data: IProduct[] }>(`/products?search=${encodeURIComponent(query)}&limit=48`)
      .then(res => { setResults(res.data ?? []); setSearched(true); })
      .catch(() => { setResults([]); setSearched(true); })
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="container">
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-6">Search Products</h1>
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search for skincare, serums, soaps..."
                className="input pl-11 pr-10 h-12"
                autoFocus
              />
              {inputValue && (
                <button type="button" onClick={() => { setInputValue(''); router.push('/search'); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary px-6 h-12">Search</button>
          </form>
          {query && searched && (
            <p className="text-sm text-gray-500 mt-3">
              {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''} for` : 'No results for'}{' '}
              <span className="font-semibold text-gray-800">&quot;{query}&quot;</span>
            </p>
          )}
        </div>
      </div>

      <div className="container py-10">
        {loading && (
          <div className="grid-products">
            {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton rounded-2xl aspect-product" />)}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">Try different keywords or browse our categories</p>
            <a href="/products" className="btn-primary">Browse All Products</a>
          </div>
        )}

        {!loading && !query && !searched && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">What are you looking for?</h2>
            <p className="text-gray-500">Search for face creams, serums, natural soaps, and more</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid-products">
            {results.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
