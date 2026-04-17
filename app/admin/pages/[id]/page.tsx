'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save, ArrowLeft, Eye, EyeOff, Globe, Bold, Italic,
  List, Heading1, Heading2, Link as LinkIcon, Quote, Minus
} from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../../../lib/api';
import toast from 'react-hot-toast';
import ImageUpload from '../../../../components/ui/ImageUpload';

interface PageForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
  showInNav: boolean;
  seo: { metaTitle: string; metaDescription: string; ogImage: string };
}

const EMPTY_FORM: PageForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  isPublished: true,
  showInNav: false,
  seo: { metaTitle: '', metaDescription: '', ogImage: '' },
};

// Policy page templates
const TEMPLATES: Record<string, string> = {
  'privacy-policy': `<h2>Privacy Policy</h2>
<p>Last updated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

<h3>Information We Collect</h3>
<p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>

<h3>How We Use Your Information</h3>
<p>We use the information we collect to process transactions, send you related information including purchase confirmations and invoices, and send you promotional communications (you can opt-out).</p>

<h3>Information Sharing</h3>
<p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to trusted third parties who assist us in operating our website, conducting our business, or serving you.</p>

<h3>Data Security</h3>
<p>We implement a variety of security measures to maintain the safety of your personal information.</p>

<h3>Contact Us</h3>
<p>If you have questions about this Privacy Policy, please contact us at support@glomix.in</p>`,

  'return-policy': `<h2>Return & Refund Policy</h2>
<p>Last updated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

<h3>Return Window</h3>
<p>We accept returns within 7 days of delivery for unused, unopened products in their original packaging.</p>

<h3>Non-Returnable Items</h3>
<p>Due to hygiene reasons, the following items cannot be returned once opened: creams, serums, face wash, soaps, and other personal care products.</p>

<h3>How to Initiate a Return</h3>
<p>Email us at returns@glomix.in with your order number and reason for return. Our team will respond within 24 hours with return instructions.</p>

<h3>Refund Process</h3>
<p>Once we receive and inspect your return, we will process your refund within 5-7 business days. Refunds are credited to the original payment method.</p>

<h3>Damaged or Defective Products</h3>
<p>If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund immediately.</p>`,

  'shipping-policy': `<h2>Shipping Policy</h2>
<p>Last updated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

<h3>Shipping Rates</h3>
<p>Free shipping on all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹49 applies.</p>

<h3>Processing Time</h3>
<p>Orders are processed within 1-2 business days. You will receive a tracking number once your order ships.</p>

<h3>Delivery Timeframes</h3>
<ul>
<li>Metro cities: 2-4 business days</li>
<li>Other cities: 4-7 business days</li>
<li>Rural areas: 7-10 business days</li>
</ul>

<h3>Tracking Your Order</h3>
<p>Once shipped, you will receive an email with your tracking number. You can track your order on our website or the courier's website.</p>

<h3>International Shipping</h3>
<p>We currently only ship within India. International shipping is not available at this time.</p>`,

  'terms': `<h2>Terms of Service</h2>
<p>Last updated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

<h3>Acceptance of Terms</h3>
<p>By accessing and using this website, you accept and agree to be bound by these Terms of Service.</p>

<h3>Products and Pricing</h3>
<p>We reserve the right to modify prices at any time. All prices are in Indian Rupees (INR) and inclusive of GST.</p>

<h3>Account Responsibilities</h3>
<p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

<h3>Intellectual Property</h3>
<p>All content on this website, including text, images, graphics, and logos, is the property of Glomix and is protected by copyright laws.</p>

<h3>Limitation of Liability</h3>
<p>Glomix shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services.</p>`,
};

// Simple formatting toolbar helpers
function insertMarkup(textarea: HTMLTextAreaElement, open: string, close = open) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const newVal = textarea.value.substring(0, start) + open + selected + close + textarea.value.substring(end);
  return { value: newVal, cursor: start + open.length + selected.length + close.length };
}

export default function AdminPageEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const id = params.id as string;
  const isNew = id === 'new';

  const [form, setForm] = useState<PageForm>({
    ...EMPTY_FORM,
    title: searchParams.get('title') || '',
    slug: searchParams.get('slug') || '',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [tab, setTab] = useState<'content' | 'seo'>('content');

  // Load existing page
  useEffect(() => {
    if (!isNew) {
      apiGet<PageForm & { _id: string }>(`/admin/pages/${id}`)
        .then(p => setForm({
          title: p.title || '',
          slug: p.slug || '',
          content: p.content || '',
          excerpt: p.excerpt || '',
          isPublished: p.isPublished ?? true,
          showInNav: p.showInNav ?? false,
          seo: { metaTitle: p.seo?.metaTitle || '', metaDescription: p.seo?.metaDescription || '', ogImage: p.seo?.ogImage || '' },
        }))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  // Auto-generate slug from title (only for new pages)
  const set = <K extends keyof PageForm>(key: K, value: PageForm[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && isNew && !prev.slug) {
        next.slug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return next;
    });
  };

  const applyTemplate = () => {
    const tmpl = TEMPLATES[form.slug];
    if (!tmpl) { toast.error('No template for this slug'); return; }
    if (form.content && !confirm('Apply template? This will replace the current content.')) return;
    set('content', tmpl);
    toast.success('Template applied!');
  };

  // Toolbar action
  const toolbar = (open: string, close = open) => {
    const el = textareaRef.current;
    if (!el) return;
    const { value, cursor } = insertMarkup(el, open, close);
    set('content', value);
    setTimeout(() => { el.focus(); el.setSelectionRange(cursor, cursor); }, 0);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.slug.trim()) { toast.error('URL slug is required'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const res = await apiPost<{ data: { _id: string } }>('/admin/pages', form);
        toast.success('Page created!');
        router.replace(`/admin/pages/${res.data._id}`);
      } else {
        await apiPut(`/admin/pages/${id}`, form);
        toast.success('Page saved!');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
    </div>
  );

  const hasTemplate = !!TEMPLATES[form.slug];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-heading text-xl font-bold">{isNew ? 'New Page' : 'Edit Page'}</h1>
            {form.slug && <p className="text-xs text-gray-400 font-mono">/{form.slug}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <a href={`/${form.slug}`} target="_blank" rel="noopener noreferrer" className="btn-outline py-2 px-3 text-sm gap-1.5">
              <Globe size={14} /> View Page
            </a>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 py-2 disabled:opacity-60">
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="card p-5 space-y-4">
            <div>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className="input text-lg font-semibold"
                placeholder="Page title (e.g. Privacy Policy)"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 shrink-0 font-mono">/{' '}</span>
              <input
                type="text"
                value={form.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="input text-sm font-mono"
                placeholder="url-slug"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Short Description (optional)</label>
              <input
                type="text"
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                className="input text-sm"
                placeholder="Brief description for search results..."
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(['content', 'seo'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px capitalize transition-all ${tab === t ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {t === 'seo' ? 'SEO' : 'Content'}
              </button>
            ))}
          </div>

          {tab === 'content' && (
            <div className="card overflow-hidden">
              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
                <button onClick={() => toolbar('<h2>', '</h2>')} title="Heading 2" className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"><Heading1 size={14} /></button>
                <button onClick={() => toolbar('<h3>', '</h3>')} title="Heading 3" className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"><Heading2 size={14} /></button>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <button onClick={() => toolbar('<strong>', '</strong>')} title="Bold" className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"><Bold size={14} /></button>
                <button onClick={() => toolbar('<em>', '</em>')} title="Italic" className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"><Italic size={14} /></button>
                <div className="w-px h-4 bg-gray-200 mx-0.5" />
                <button onClick={() => toolbar('<ul>\n<li>', '</li>\n</ul>')} title="Bullet List" className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"><List size={14} /></button>
                <button onClick={() => toolbar('<blockquote>', '</blockquote>')} title="Quote" className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"><Quote size={14} /></button>
                <button onClick={() => toolbar('<a href="">', '</a>')} title="Link" className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"><LinkIcon size={14} /></button>
                <button onClick={() => toolbar('<hr />', '')} title="Divider" className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"><Minus size={14} /></button>
                <div className="flex-1" />
                <button onClick={() => setPreview(p => !p)} className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${preview ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {preview ? <EyeOff size={12} /> : <Eye size={12} />}
                  {preview ? 'Edit' : 'Preview'}
                </button>
                {hasTemplate && (
                  <button onClick={applyTemplate} className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all ml-1">
                    ✨ Use Template
                  </button>
                )}
              </div>

              {preview ? (
                <div
                  className="p-6 prose prose-sm max-w-none min-h-[400px]"
                  style={{ lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-gray-400 italic">No content yet...</p>' }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={form.content}
                  onChange={e => set('content', e.target.value)}
                  className="w-full p-5 font-mono text-sm resize-none min-h-[400px] focus:outline-none bg-white"
                  placeholder={`Write HTML content here, or click "Use Template" above to start from a pre-written template.\n\nExample:\n<h2>Section Title</h2>\n<p>Your paragraph text...</p>`}
                />
              )}
            </div>
          )}

          {tab === 'seo' && (
            <div className="card p-6 space-y-4">
              <p className="text-sm text-gray-400">Override SEO settings for this page. Leave blank to use site defaults.</p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Meta Title</label>
                <input
                  type="text"
                  value={form.seo.metaTitle}
                  onChange={e => set('seo', { ...form.seo, metaTitle: e.target.value })}
                  className="input"
                  placeholder={`${form.title} | Glomix`}
                />
                <p className="text-xs text-gray-400 mt-1">{form.seo.metaTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Meta Description</label>
                <textarea rows={3} value={form.seo.metaDescription} onChange={e => set('seo', { ...form.seo, metaDescription: e.target.value })} className="input resize-none" placeholder="Brief description for search engines..." />
                <p className="text-xs text-gray-400 mt-1">{form.seo.metaDescription.length}/160 characters</p>
              </div>
              <ImageUpload
                label="OG Image"
                hint="Recommended: 1200×628px"
                aspect="aspect-[1200/628]"
                value={form.seo.ogImage}
                onChange={url => set('seo', { ...form.seo, ogImage: url })}
              />
            </div>
          )}
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Visibility</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Published</p>
                <p className="text-xs text-gray-400 mt-0.5">Visible to store visitors</p>
              </div>
              <button onClick={() => set('isPublished', !form.isPublished)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-green-500' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Show in Nav</p>
                <p className="text-xs text-gray-400 mt-0.5">Add link to header menu</p>
              </div>
              <button onClick={() => set('showInNav', !form.showInNav)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.showInNav ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.showInNav ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-3">Tips</h3>
            <ul className="text-xs text-gray-500 space-y-2">
              <li>• You can write plain HTML or use the toolbar buttons</li>
              <li>• For policy pages, click <strong>✨ Use Template</strong> to get a ready-made starting point</li>
              <li>• The URL will be <code className="bg-gray-100 px-1 rounded">yourdomain.com/{form.slug || 'your-slug'}</code></li>
              <li>• Toggle <strong>Published</strong> to save as draft without showing to visitors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
