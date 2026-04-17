'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Upload, X, Plus, Layers,
  Package, Tag, Image as ImageIcon, Eye, EyeOff, Star
} from 'lucide-react';
import { apiGet, apiPost, apiUpload } from '../../../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../../../lib/utils';

type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'tags';
interface TemplateField { key: string; label: string; type: FieldType; options: string[]; placeholder: string; unit: string; helpText: string; required: boolean; }
interface Template { _id: string; name: string; emoji: string; description: string; fields: TemplateField[]; }
interface Category { _id: string; name: string; }

interface CoreForm {
  name: string; sku: string; category: string;
  price: string; salePrice: string; stock: string;
  shortDescription: string; description: string;
  isFeatured: boolean; isActive: boolean;
  tags: string; benefits: string;
  seo: { metaTitle: string; metaDescription: string; keywords: string; };
}

const EMPTY_CORE: CoreForm = {
  name: '', sku: '', category: '', price: '', salePrice: '', stock: '0',
  shortDescription: '', description: '', isFeatured: false, isActive: true,
  tags: '', benefits: '',
  seo: { metaTitle: '', metaDescription: '', keywords: '' },
};

// ── Dynamic field renderer ───────────────────────────────────
function DynamicField({ field, value, onChange }: {
  field: TemplateField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const [tagInput, setTagInput] = useState('');

  const strVal = (value as string) ?? '';
  const numVal = (value as number) ?? '';
  const boolVal = (value as boolean) ?? false;
  const arrVal: string[] = Array.isArray(value) ? value : [];

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !arrVal.includes(t)) { onChange([...arrVal, t]); }
    setTagInput('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
        {field.unit && <span className="text-gray-400 ml-1 text-xs">({field.unit})</span>}
      </label>

      {field.type === 'text' && (
        <input type="text" value={strVal} onChange={e => onChange(e.target.value)} className="input" placeholder={field.placeholder} />
      )}

      {field.type === 'number' && (
        <input type="number" value={numVal} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} className="input" placeholder={field.placeholder} min={0} />
      )}

      {field.type === 'textarea' && (
        <textarea rows={4} value={strVal} onChange={e => onChange(e.target.value)} className="input resize-none" placeholder={field.placeholder} />
      )}

      {field.type === 'boolean' && (
        <button
          onClick={() => onChange(!boolVal)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border-2 w-full text-sm font-medium transition-all',
            boolVal ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'
          )}
        >
          <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', boolVal ? 'border-green-500 bg-green-500' : 'border-gray-300')}>
            {boolVal && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          {boolVal ? 'Yes ✓' : 'No'}
        </button>
      )}

      {field.type === 'select' && (
        <select value={strVal} onChange={e => onChange(e.target.value)} className="input">
          <option value="">Select {field.label}...</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {field.type === 'multiselect' && (
        <div className="flex flex-wrap gap-2">
          {field.options.map(o => {
            const selected = arrVal.includes(o);
            return (
              <button
                key={o}
                onClick={() => onChange(selected ? arrVal.filter(x => x !== o) : [...arrVal, o])}
                className={cn(
                  'text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-all',
                  selected ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                )}
              >
                {selected && '✓ '}{o}
              </button>
            );
          })}
        </div>
      )}

      {field.type === 'tags' && (
        <div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="input flex-1"
              placeholder={field.placeholder || 'Type and press Enter...'}
            />
            <button onClick={addTag} className="btn-primary py-2 px-3 text-sm">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {arrVal.map(tag => (
              <span key={tag} className="flex items-center gap-1.5 text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {tag}
                <button onClick={() => onChange(arrVal.filter(t => t !== tag))} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {field.helpText && <p className="text-xs text-gray-400 mt-1.5">{field.helpText}</p>}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetTemplateId = searchParams.get('template');
  const fileRef = useRef<HTMLInputElement>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [core, setCore] = useState<CoreForm>(EMPTY_CORE);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'core' | 'template' | 'images' | 'seo'>('core');
  const [tagInput, setTagInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  useEffect(() => {
    Promise.all([
      apiGet<Template[]>('/admin/product-templates').catch(() => []),
      apiGet<Category[]>('/admin/categories').catch(() => []),
    ]).then(([tmplData, catData]) => {
      setTemplates(Array.isArray(tmplData) ? tmplData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      if (presetTemplateId) {
        const found = (Array.isArray(tmplData) ? tmplData : []).find((t: Template) => t._id === presetTemplateId);
        if (found) setSelectedTemplate(found);
      }
    });
  }, [presetTemplateId]);

  const setCore_ = <K extends keyof CoreForm>(k: K, v: CoreForm[K]) =>
    setCore(p => ({ ...p, [k]: v }));

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('images', file);
        const res = await apiUpload<{ images: string[] }>(`/admin/products/temp/images`, fd).catch(async () => {
          // fallback: try banner upload endpoint
          const fd2 = new FormData();
          fd2.append('image', file);
          const r = await apiUpload<{ url: string }>('/admin/banners/upload', fd2);
          return { images: [r.url] };
        });
        setImages(prev => [...prev, ...(res?.images || [])]);
      }
      toast.success('Images uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleImageUpload(e.dataTransfer.files);
  };

  const generateSku = () => {
    const prefix = core.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
    setCore_('sku', `${prefix}-${rand}`);
  };

  const handleSave = async () => {
    if (!core.name.trim()) { toast.error('Product name is required'); setTab('core'); return; }
    if (!core.category) { toast.error('Category is required'); setTab('core'); return; }
    if (!core.price) { toast.error('Price is required'); setTab('core'); return; }
    if (!core.description.trim()) { toast.error('Description is required'); setTab('core'); return; }

    // Validate required template fields
    if (selectedTemplate) {
      for (const f of selectedTemplate.fields) {
        if (f.required) {
          const val = customFields[f.key];
          if (val === undefined || val === '' || val === null || (Array.isArray(val) && val.length === 0)) {
            toast.error(`"${f.label}" is required in template fields`);
            setTab('template');
            return;
          }
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: core.name,
        sku: core.sku,
        category: core.category,
        price: Number(core.price),
        salePrice: core.salePrice ? Number(core.salePrice) : undefined,
        stock: Number(core.stock),
        shortDescription: core.shortDescription,
        description: core.description,
        isFeatured: core.isFeatured,
        isActive: core.isActive,
        images,
        tags: core.tags ? core.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        benefits: core.benefits ? core.benefits.split('\n').map(b => b.trim()).filter(Boolean) : [],
        seo: {
          metaTitle: core.seo.metaTitle,
          metaDescription: core.seo.metaDescription,
          keywords: core.seo.keywords ? core.seo.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        },
        templateId: selectedTemplate?._id,
        customFields,
      };

      await apiPost('/admin/products', payload);
      toast.success('Product created!');
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to create product');
    } finally { setSaving(false); }
  };

  const TABS = [
    { key: 'core', label: 'Core Info', icon: Package },
    ...(selectedTemplate ? [{ key: 'template', label: `${selectedTemplate.emoji} ${selectedTemplate.name}`, icon: Layers }] : []),
    { key: 'images', label: `Images (${images.length})`, icon: ImageIcon },
    { key: 'seo', label: 'SEO', icon: Tag },
  ] as { key: typeof tab; label: string; icon: React.FC<{ size?: number }> }[];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-heading text-xl font-bold">Add New Product</h1>
            {selectedTemplate && (
              <p className="text-xs text-gray-400">{selectedTemplate.emoji} Using template: {selectedTemplate.name}</p>
            )}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
          <Save size={15} />{saving ? 'Saving...' : 'Create Product'}
        </button>
      </div>

      {/* Template selector */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm flex items-center gap-2"><Layers size={15} /> Product Template</h2>
          {selectedTemplate && (
            <button onClick={() => { setSelectedTemplate(null); setCustomFields({}); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
              <X size={12} /> Remove template
            </button>
          )}
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-2">No templates installed yet.</p>
            <Link href="/admin/product-templates" className="text-sm text-blue-600 underline">Go to Product Templates →</Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedTemplate(null); setCustomFields({}); }}
              className={cn(
                'px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                !selectedTemplate ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-100 text-gray-500 hover:border-gray-300'
              )}
            >
              📦 No template
            </button>
            {templates.map(t => (
              <button
                key={t._id}
                onClick={() => { setSelectedTemplate(t); setCustomFields({}); setTab('core'); }}
                className={cn(
                  'px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                  selectedTemplate?._id === t._id
                    ? 'border-gray-800 bg-gray-800 text-white'
                    : 'border-gray-100 text-gray-600 hover:border-gray-300'
                )}
              >
                {t.emoji} {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all',
              tab === key ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Core fields ── */}
      {tab === 'core' && (
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input type="text" value={core.name} onChange={e => setCore_('name', e.target.value)} className="input text-base font-medium" placeholder="e.g. Rose & Sandalwood Soap" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU *</label>
                <div className="flex gap-2">
                  <input type="text" value={core.sku} onChange={e => setCore_('sku', e.target.value.toUpperCase())} className="input font-mono text-sm flex-1" placeholder="SOAP-001" />
                  <button onClick={generateSku} title="Auto-generate" className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-all shrink-0">Auto</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select value={core.category} onChange={e => setCore_('category', e.target.value)} className="input">
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
                <input type="number" value={core.price} onChange={e => setCore_('price', e.target.value)} className="input" placeholder="399" min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sale Price (₹)</label>
                <input type="number" value={core.salePrice} onChange={e => setCore_('salePrice', e.target.value)} className="input" placeholder="299" min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                <input type="number" value={core.stock} onChange={e => setCore_('stock', e.target.value)} className="input" min={0} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
              <input type="text" value={core.shortDescription} onChange={e => setCore_('shortDescription', e.target.value)} className="input" placeholder="One-line summary shown in product cards" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea rows={5} value={core.description} onChange={e => setCore_('description', e.target.value)} className="input resize-none" placeholder="Full product description..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags <span className="text-gray-400 text-xs">(comma separated)</span></label>
              <input type="text" value={core.tags} onChange={e => setCore_('tags', e.target.value)} className="input" placeholder="natural, organic, vegan, cruelty-free" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Benefits <span className="text-gray-400 text-xs">(one per line)</span></label>
              <textarea rows={3} value={core.benefits} onChange={e => setCore_('benefits', e.target.value)} className="input resize-none" placeholder={"Deeply moisturizes skin\nReduces dryness\nNatural fragrance"} />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  onClick={() => setCore_('isActive', !core.isActive)}
                  className={cn('relative w-11 h-6 rounded-full transition-colors', core.isActive ? 'bg-green-500' : 'bg-gray-200')}
                >
                  <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', core.isActive ? 'translate-x-5' : '')} />
                </button>
                <span className="text-sm font-medium">{core.isActive ? <><Eye size={14} className="inline mr-1" />Active</> : <><EyeOff size={14} className="inline mr-1" />Inactive</>}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  onClick={() => setCore_('isFeatured', !core.isFeatured)}
                  className={cn('relative w-11 h-6 rounded-full transition-colors', core.isFeatured ? 'bg-yellow-400' : 'bg-gray-200')}
                >
                  <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', core.isFeatured ? 'translate-x-5' : '')} />
                </button>
                <span className="text-sm font-medium"><Star size={14} className={cn('inline mr-1', core.isFeatured ? 'text-yellow-500' : 'text-gray-400')} />Featured</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Template-specific fields ── */}
      {tab === 'template' && selectedTemplate && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{selectedTemplate.emoji}</span>
            <div>
              <h2 className="font-semibold">{selectedTemplate.name} Details</h2>
              <p className="text-xs text-gray-400">{selectedTemplate.description}</p>
            </div>
          </div>
          {selectedTemplate.fields
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map(field => (
              <DynamicField
                key={field.key}
                field={field}
                value={customFields[field.key]}
                onChange={val => setCustomFields(prev => ({ ...prev, [field.key]: val }))}
              />
            ))}
        </div>
      )}

      {/* ── Images ── */}
      {tab === 'images' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-800">Product Images</h2>
            <span className="size-hint">📐 Recommended: 800 × 800 px (1:1 square)</span>
          </div>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-600">Drop images here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — up to 5MB each</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && handleImageUpload(e.target.files)} />

          {/* Or paste URL */}
          <div className="flex gap-2">
            <input
              type="url"
              className="input text-sm font-mono flex-1"
              placeholder="Or paste image URL directly (Cloudinary, etc.)"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) { setImages(prev => [...prev, val]); (e.target as HTMLInputElement).value = ''; }
                }
              }}
            />
            <button
              onClick={e => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                if (input.value.trim()) { setImages(prev => [...prev, input.value.trim()]); input.value = ''; }
              }}
              className="btn-outline py-2 px-4 text-sm"
            >
              Add URL
            </button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 text-xs bg-gray-800 text-white px-1.5 py-0.5 rounded font-medium">Main</span>}
                  <button
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SEO ── */}
      {tab === 'seo' && (
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
            <input type="text" value={core.seo.metaTitle} onChange={e => setCore_('seo', { ...core.seo, metaTitle: e.target.value })} className="input" placeholder={`${core.name || 'Product name'} | Glomix`} />
            <p className="text-xs text-gray-400 mt-1">{core.seo.metaTitle.length}/60 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
            <textarea rows={3} value={core.seo.metaDescription} onChange={e => setCore_('seo', { ...core.seo, metaDescription: e.target.value })} className="input resize-none" />
            <p className="text-xs text-gray-400 mt-1">{core.seo.metaDescription.length}/160 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Keywords <span className="text-gray-400 text-xs">(comma separated)</span></label>
            <input type="text" value={core.seo.keywords} onChange={e => setCore_('seo', { ...core.seo, keywords: e.target.value })} className="input" placeholder="natural soap, organic skincare, handmade" />
          </div>
        </div>
      )}

      {/* Bottom save */}
      <div className="flex items-center justify-between py-2">
        <Link href="/admin/products" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back to Products</Link>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
          <Save size={15} />{saving ? 'Saving...' : 'Create Product'}
        </button>
      </div>
    </div>
  );
}
