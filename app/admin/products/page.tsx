'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, Star, Package } from 'lucide-react';
import { apiGet, apiPut, apiDelete } from '../../../lib/api';
import { IProduct, ICategory, PaginatedResponse } from '../../../types';
import { formatPrice, getDiscountPercent } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<IProduct>>(`/admin/products?page=${page}&search=${search}`);
      const r = res as unknown as { data: IProduct[]; pagination: { total: number; pages: number } };
      setProducts(r.data ?? []);
      setTotal(r.pagination?.total ?? 0);
      setPages(r.pagination?.pages ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [page, search]); // eslint-disable-line

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await apiDelete(`/admin/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id: string) => {
    try {
      await apiPut(`/admin/products/${id}/toggle`, {});
      toast.success('Status updated');
      loadProducts();
    } catch { toast.error('Toggle failed'); }
  };

  return (
    <div className="space-y-6" style={{ color: 'var(--color-text)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Package size={22} /> Products
          </h1>
          <p className="text-gray-400 text-sm mt-1">{total} products total</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary gap-2">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9"
          />
        </div>
        <Link href="/admin/product-templates" className="btn-outline text-sm gap-2 py-2 px-4">
          🗂 Templates
        </Link>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Price</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Stock</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-3 px-4">
                      <div className="skeleton h-10 rounded-lg" />
                    </td>
                  </tr>
                ))
                : products.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Package size={40} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400 text-sm font-medium">No products yet</p>
                        <Link href="/admin/products/new" className="btn-primary gap-2 inline-flex mt-4 text-sm">
                          <Plus size={14} /> Add Your First Product
                        </Link>
                      </td>
                    </tr>
                  )
                  : products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                            {p.images[0]
                              ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={18} /></div>
                            }
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                              {p.isFeatured && <Star size={12} className="text-yellow-400 shrink-0 fill-yellow-400" />}
                            </div>
                            <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell">
                        {typeof p.category === 'object' ? (p.category as ICategory).name : '—'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{formatPrice(p.salePrice || p.price)}</span>
                          {p.salePrice && (
                            <>
                              <span className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</span>
                              {getDiscountPercent(p.price, p.salePrice) && (
                                <span className="badge badge-danger text-xs">{getDiscountPercent(p.price, p.salePrice)}% off</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {p.stock}
                          {p.stock === 0 && <span className="text-xs font-normal ml-1">Out of stock</span>}
                          {p.stock > 0 && p.stock < 5 && <span className="text-xs font-normal ml-1">Low</span>}
                        </span>
                      </td>

                      {/* Status toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggle(p._id)}
                          className="flex items-center gap-1.5 text-sm transition-colors"
                          title={p.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {p.isActive
                            ? <ToggleRight size={22} className="text-green-500" />
                            : <ToggleLeft size={22} className="text-gray-300" />}
                          <span className={p.isActive ? 'text-green-500 text-xs font-medium' : 'text-gray-400 text-xs'}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${p._id}/edit`}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                            title="Edit product"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-all"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Page {page} of {pages} — {total} products
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(pages, 7) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
