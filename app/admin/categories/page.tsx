'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Loader2, Grid3X3 } from 'lucide-react';
import ImageUpload from '../../../components/ui/ImageUpload';

interface Category { _id: string; name: string; slug: string; description?: string; image?: string; isActive: boolean; productCount?: number; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', isActive: true });

  const fetch = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.data ?? []);
    } catch { setCategories([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const reset = () => { setForm({ name: '', description: '', image: '', isActive: true }); setEditId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) { await api.put(`/admin/categories/${editId}`, form); toast.success('Category updated'); }
      else { await api.post('/admin/categories', form); toast.success('Category created'); }
      reset(); fetch();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error saving');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/admin/categories/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Cannot delete — may have products linked'); }
  };

  const startEdit = (c: Category) => {
    setForm({ name: c.name, description: c.description ?? '', image: c.image ?? '', isActive: c.isActive });
    setEditId(c._id); setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-heading">Categories</h1><p className="text-gray-400 text-sm mt-1">Organise your product catalogue</p></div>
        <button onClick={() => { reset(); setShowForm(true); }} className="btn-primary gap-2"><Plus size={16} /> New Category</button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">{editId ? 'Edit' : 'Create'} Category</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Category Image"
                hint="Recommended: 600×400px"
                aspect="aspect-[3/2]"
                value={form.image}
                onChange={url => setForm(f => ({ ...f, image: url }))}
              />
            </div>
            <div className="md:col-span-2"><label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cat-active" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="cat-active" className="text-sm">Active</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary gap-2">{saving && <Loader2 size={14} className="animate-spin" />}{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={reset} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center p-12"><Loader2 className="animate-spin text-gray-600" size={28} /></div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center p-12 text-gray-500 card">
            <Grid3X3 size={40} className="mx-auto mb-3 opacity-30" />
            <p>No categories yet. Add your first one!</p>
          </div>
        ) : categories.map(c => (
          <div key={c._id} className="card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-900/30 flex items-center justify-center">
              {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : <Grid3X3 size={24} className="text-gray-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.productCount ?? 0} products</p>
              <span className={`badge text-xs mt-1 ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Hidden'}</span>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => startEdit(c)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(c._id)} className="btn-ghost p-1.5 text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
