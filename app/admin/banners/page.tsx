'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon, Plus, Trash2, Pencil, ToggleLeft, ToggleRight,
  X, Save, Upload, ExternalLink, GripVertical, Eye, EyeOff
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from '../../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../../lib/utils';

type BannerPosition = 'hero' | 'mid' | 'popup' | 'announcement';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  position: BannerPosition;
  isActive: boolean;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  ctaText?: string;
  startDate?: string;
  endDate?: string;
}

interface BannerForm {
  title: string;
  subtitle: string;
  image: string;
  mobileImage: string;
  link: string;
  position: BannerPosition;
  isActive: boolean;
  order: number;
  backgroundColor: string;
  textColor: string;
  ctaText: string;
  startDate: string;
  endDate: string;
}

const EMPTY_FORM: BannerForm = {
  title: '',
  subtitle: '',
  image: '',
  mobileImage: '',
  link: '',
  position: 'hero',
  isActive: true,
  order: 0,
  backgroundColor: '',
  textColor: '',
  ctaText: 'Shop Now',
  startDate: '',
  endDate: '',
};

const POSITION_LABELS: Record<BannerPosition, { label: string; color: string; desc: string; size: string; ratio: string }> = {
  hero:         { label: 'Hero',         color: 'bg-violet-100 text-violet-700',  desc: 'Main homepage hero banner',            size: '1920 × 800 px',  ratio: '12:5' },
  mid:          { label: 'Mid-page',     color: 'bg-blue-100 text-blue-700',      desc: 'Below-fold promotional banner',        size: '1920 × 600 px',  ratio: '16:5' },
  popup:        { label: 'Popup',        color: 'bg-orange-100 text-orange-700',  desc: 'Modal popup promotion',                size: '800 × 600 px',   ratio: '4:3'  },
  announcement: { label: 'Announcement', color: 'bg-green-100 text-green-700',    desc: 'Text-based announcement strip',        size: '1200 × 80 px',   ratio: '15:1' },
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterPos, setFilterPos] = useState<BannerPosition | 'all'>('all');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Banner[]>('/admin/banners');
      setBanners(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load banners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditId(b._id);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      image: b.image || '',
      mobileImage: b.mobileImage || '',
      link: b.link || '',
      position: b.position || 'hero',
      isActive: b.isActive ?? true,
      order: b.order ?? 0,
      backgroundColor: b.backgroundColor || '',
      textColor: b.textColor || '',
      ctaText: b.ctaText || 'Shop Now',
      startDate: b.startDate ? b.startDate.slice(0, 16) : '',
      endDate: b.endDate ? b.endDate.slice(0, 16) : '',
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditId(null); };

  const set = <K extends keyof BannerForm>(key: K, val: BannerForm[K]) =>
    setForm(p => ({ ...p, [key]: val }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await apiUpload<{ url: string }>('/admin/banners/upload', fd);
      set('image', res.url);
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageUpload(file);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.image.trim()) { toast.error('Banner image is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        order: Number(form.order),
      };
      if (editId) {
        await apiPut(`/admin/banners/${editId}`, payload);
        toast.success('Banner updated!');
      } else {
        await apiPost('/admin/banners', payload);
        toast.success('Banner created!');
      }
      closeDrawer();
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to save banner');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return;
    try {
      await apiDelete(`/admin/banners/${id}`);
      toast.success('Banner deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      await apiPut(`/admin/banners/${b._id}`, { isActive: !b.isActive });
      setBanners(prev => prev.map(x => x._id === b._id ? { ...x, isActive: !x.isActive } : x));
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = filterPos === 'all' ? banners : banners.filter(b => b.position === filterPos);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <ImageIcon size={22} /> Banners
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage hero banners, mid-page promotions, popups, and announcement strips
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Position info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(POSITION_LABELS) as [BannerPosition, typeof POSITION_LABELS['hero']][]).map(([pos, info]) => {
          const count = banners.filter(b => b.position === pos).length;
          return (
            <button
              key={pos}
              onClick={() => setFilterPos(filterPos === pos ? 'all' : pos)}
              className={cn(
                'card p-4 text-left transition-all hover:scale-[1.02]',
                filterPos === pos ? 'ring-2 ring-gray-800' : ''
              )}
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
              <p className="text-2xl font-bold mt-2">{count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{info.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Banner list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <ImageIcon size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No banners yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add your first banner to display on the storefront.</p>
          <button onClick={openCreate} className="btn-primary gap-2 inline-flex">
            <Plus size={16} /> Add Banner
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(banner => {
            const pos = POSITION_LABELS[banner.position];
            return (
              <div key={banner._id} className="card p-4 flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-32 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  {/* Active indicator */}
                  <div className={cn(
                    'absolute top-1 right-1 w-2 h-2 rounded-full',
                    banner.isActive ? 'bg-green-400' : 'bg-gray-300'
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{banner.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${pos.color}`}>
                      {pos.label}
                    </span>
                    {!banner.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>
                  {banner.subtitle && (
                    <p className="text-xs text-gray-400 truncate mb-1">{banner.subtitle}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {banner.ctaText && <span>CTA: "{banner.ctaText}"</span>}
                    {banner.link && (
                      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                        <ExternalLink size={10} /> Link
                      </a>
                    )}
                    <span>Order: {banner.order}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                    className={cn(
                      'p-2 rounded-lg transition-all text-sm',
                      banner.isActive
                        ? 'text-green-500 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    )}
                  >
                    {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id, banner.title)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Slide-in Drawer ─────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={closeDrawer} />

          {/* Panel */}
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-heading text-lg font-bold">
                {editId ? 'Edit Banner' : 'Add Banner'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary py-2 px-4 text-sm gap-2 disabled:opacity-60"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
                <button onClick={closeDrawer} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 p-6 space-y-5">
              {/* Position selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(POSITION_LABELS) as [BannerPosition, typeof POSITION_LABELS['hero']][]).map(([pos, info]) => (
                    <button
                      key={pos}
                      onClick={() => set('position', pos)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        form.position === pos
                          ? 'border-gray-800 bg-gray-50'
                          : 'border-gray-100 hover:border-gray-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.color}`}>
                          {info.label}
                        </span>
                        <span className="size-hint">{info.size}</span>
                      </div>
                      <p className="text-xs mt-1.5 leading-relaxed" style={{color:'#374151'}}>{info.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    className="input"
                    placeholder="Summer Sale — Up to 40% Off"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={e => set('subtitle', e.target.value)}
                    className="input"
                    placeholder="Shop our premium natural skincare collection"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Banner Image *</label>
                  <span className="size-hint">📐 Recommended: {POSITION_LABELS[form.position].size} ({POSITION_LABELS[form.position].ratio})</span>
                </div>

                {form.image ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 group">
                    <img src={form.image} alt="Banner preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-all"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => set('image', '')}
                        className="px-3 py-1.5 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Uploading to Cloudinary...</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm font-medium text-gray-600">Drop image here or click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — Recommended: 1920×800px</p>
                      </>
                    )}
                  </div>
                )}

                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />

                {/* Or paste URL */}
                <div className="mt-2">
                  <input
                    type="url"
                    value={form.image}
                    onChange={e => set('image', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="Or paste image URL directly..."
                  />
                </div>
              </div>

              {/* CTA & Link */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Button Text</label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={e => set('ctaText', e.target.value)}
                    className="input text-sm"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={e => set('link', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="/products"
                  />
                </div>
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={e => set('order', Number(e.target.value))}
                    className="input text-sm"
                    min={0}
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower = shown first</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <button
                    onClick={() => set('isActive', !form.isActive)}
                    className={cn(
                      'w-full py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
                      form.isActive
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    )}
                  >
                    {form.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                    {form.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              {/* Scheduled dates */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Schedule (optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                    <input
                      type="datetime-local"
                      value={form.startDate}
                      onChange={e => set('startDate', e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                    <input
                      type="datetime-local"
                      value={form.endDate}
                      onChange={e => set('endDate', e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">Leave blank to show indefinitely</p>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Background Color (optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.backgroundColor || '#111827'}
                      onChange={e => set('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={form.backgroundColor}
                      onChange={e => set('backgroundColor', e.target.value)}
                      className="input text-xs font-mono flex-1"
                      placeholder="#111827"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Text Color (optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.textColor || '#FFFFFF'}
                      onChange={e => set('textColor', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={form.textColor}
                      onChange={e => set('textColor', e.target.value)}
                      className="input text-xs font-mono flex-1"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
