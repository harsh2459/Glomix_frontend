'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', type: 'percentage' as 'percentage' | 'fixed',
    value: '', minOrderAmount: '0', maxUses: '100', expiresAt: '', isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.data ?? []);
    } catch { setCoupons([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const reset = () => {
    setForm({ code: '', type: 'percentage', value: '', minOrderAmount: '0', maxUses: '100', expiresAt: '', isActive: true });
    setEditId(null); setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, value: Number(form.value), minOrderAmount: Number(form.minOrderAmount), maxUses: Number(form.maxUses) };
      if (editId) { await api.put(`/admin/coupons/${editId}`, payload); toast.success('Coupon updated'); }
      else { await api.post('/admin/coupons', payload); toast.success('Coupon created'); }
      reset(); fetchCoupons();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving coupon');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try { await api.delete(`/admin/coupons/${id}`); toast.success('Deleted'); fetchCoupons(); }
    catch { toast.error('Error deleting coupon'); }
  };

  const startEdit = (c: Coupon) => {
    setForm({ code: c.code, type: c.type, value: String(c.value), minOrderAmount: String(c.minOrderAmount), maxUses: String(c.maxUses), expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '', isActive: c.isActive });
    setEditId(c._id); setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-heading">Coupons</h1><p className="text-gray-400 text-sm mt-1">Manage discount codes</p></div>
        <button onClick={() => { reset(); setShowForm(true); }} className="btn-primary gap-2"><Plus size={16} /> New Coupon</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Code *</label>
              <input className="input uppercase" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Type *</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select></div>
            <div><label className="block text-xs text-gray-400 mb-1">Value *</label>
              <input type="number" className="input" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Min Order (₹)</label>
              <input type="number" className="input" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Max Uses</label>
              <input type="number" className="input" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Expires At</label>
              <input type="date" className="input" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} /></div>
            <div className="flex items-center gap-2 col-span-full">
              <input type="checkbox" id="coupon-active" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="coupon-active" className="text-sm">Active</label>
            </div>
            <div className="col-span-full flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : null}{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={reset} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-gray-600" size={28} /></div>
        ) : coupons.length === 0 ? (
          <div className="text-center p-12 text-gray-500"><Tag size={40} className="mx-auto mb-3 opacity-30" /><p>No coupons yet. Create your first discount code!</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
              <th className="text-left p-4">Code</th><th className="text-left p-4">Discount</th>
              <th className="text-left p-4">Min Order</th><th className="text-left p-4">Uses</th>
              <th className="text-left p-4">Expires</th><th className="text-left p-4">Status</th>
              <th className="p-4"></th>
            </tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-gray-500">{c.code}</td>
                  <td className="p-4">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="p-4">₹{c.minOrderAmount}</td>
                  <td className="p-4">{c.usedCount}/{c.maxUses}</td>
                  <td className="p-4 text-gray-400">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="p-4"><span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-4"><div className="flex items-center gap-2">
                    <button onClick={() => startEdit(c)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c._id)} className="btn-ghost p-1.5 text-red-400"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
