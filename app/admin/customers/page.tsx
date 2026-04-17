'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Users, Loader2, Search } from 'lucide-react';

interface Customer { _id: string; name: string; email: string; phone?: string; isActive: boolean; createdAt: string; wishlist: string[]; }

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/customers?page=${page}&limit=20&search=${search}`);
      setCustomers(res.data.data ?? []);
      setTotal(res.data.pagination?.total ?? 0);
    } catch { setCustomers([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [page, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold font-heading">Customers</h1><p className="text-gray-400 text-sm mt-1">{total} registered customers</p></div>
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-9 w-60" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-600" size={28} /></div>
        ) : customers.length === 0 ? (
          <div className="text-center p-12 text-gray-500"><Users size={40} className="mx-auto mb-3 opacity-30" /><p>{search ? 'No customers match your search' : 'No customers yet'}</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
              <th className="text-left p-4">Customer</th><th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Joined</th><th className="text-left p-4">Wishlist</th><th className="text-left p-4">Status</th>
            </tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--color-primary)' }}>{c.name[0]}</div>
                      <div><p className="font-medium">{c.name}</p><p className="text-xs text-gray-500">{c.email}</p></div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{c.phone ?? '—'}</td>
                  <td className="p-4 text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-4">{c.wishlist?.length ?? 0} items</td>
                  <td className="p-4"><span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Blocked'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Prev</button>
          <span className="flex items-center px-4 text-sm text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <button disabled={page >= Math.ceil(total/20)} onClick={() => setPage(p => p + 1)} className="btn-outline py-2 px-4 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
