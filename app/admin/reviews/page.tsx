'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Star, Loader2, Check, X } from 'lucide-react';

interface Review {
  _id: string;
  user: { name: string; email: string } | string;
  product: { name: string; slug: string } | string;
  rating: number;
  title?: string;
  body: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = filter === 'pending' ? '?isApproved=false' : filter === 'approved' ? '?isApproved=true' : '';
      const res = await api.get(`/admin/reviews${q}`);
      setReviews(res.data.data ?? []);
    } catch { setReviews([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      await api.put(`/admin/reviews/${id}`, { isApproved: approve });
      toast.success(approve ? 'Review approved' : 'Review hidden');
      fetchReviews();
    } catch { toast.error('Error updating review'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    try { await api.delete(`/admin/reviews/${id}`); toast.success('Deleted'); fetchReviews(); }
    catch { toast.error('Error'); }
  };

  const userName = (u: Review['user']) => typeof u === 'object' ? u.name : 'User';
  const productName = (p: Review['product']) => typeof p === 'object' ? p.name : 'Product';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold font-heading">Reviews</h1><p className="text-gray-400 text-sm mt-1">Moderate customer reviews</p></div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'btn-primary py-2 px-4 text-sm' : 'btn-outline py-2 px-4 text-sm capitalize'}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-600" size={28} /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center p-12 text-gray-500"><Star size={40} className="mx-auto mb-3 opacity-30" /><p>No reviews found</p></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map(r => (
              <div key={r._id} className="p-5 flex gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-semibold text-sm">{userName(r.user)}</span>
                    <span className="text-xs text-gray-500">on</span>
                    <span className="text-xs text-gray-500">{productName(r.product)}</span>
                    <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />)}</div>
                    <span className={`badge text-xs ${r.isApproved ? 'badge-success' : 'badge-warning'}`}>{r.isApproved ? 'Approved' : 'Pending'}</span>
                  </div>
                  {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                  <p className="text-sm text-gray-400">{r.body}</p>
                  <p className="text-xs text-gray-600 mt-2">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!r.isApproved && <button onClick={() => handleApprove(r._id, true)} className="btn-ghost p-1.5 text-green-400"><Check size={16} /></button>}
                  {r.isApproved && <button onClick={() => handleApprove(r._id, false)} className="btn-ghost p-1.5 text-yellow-400"><X size={16} /></button>}
                  <button onClick={() => handleDelete(r._id)} className="btn-ghost p-1.5 text-red-400"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
