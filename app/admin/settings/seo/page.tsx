'use client';
import { useEffect, useState } from 'react';
import { Search, Save, Globe } from 'lucide-react';
import { apiGet, apiPut } from '../../../../lib/api';
import { ISiteSettings } from '../../../../types';
import toast from 'react-hot-toast';
import ImageUpload from '../../../../components/ui/ImageUpload';

export default function AdminSEOPage() {
  const [seo, setSeo] = useState<ISiteSettings['seo'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet<unknown>('/settings').then((res) => {
      const s = (res as { data: ISiteSettings }).data?.seo;
      setSeo(s);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!seo) return;
    setSaving(true);
    try {
      await apiPut('/admin/settings/seo', seo);
      toast.success('SEO settings saved!');
    } catch { toast.error('Failed to save SEO settings'); }
    finally { setSaving(false); }
  };

  if (loading || !seo) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Globe size={22} /> SEO Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage global SEO meta tags and Google visibility</p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Title <span className="text-gray-500 font-normal">(appears in browser tab & Google)</span></label>
          <input type="text" value={seo.siteTitle} onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })} className="input" placeholder="Glomix — Premium Natural Beauty & Skincare" />
          <p className="text-xs text-gray-500 mt-1">{seo.siteTitle.length}/60 characters recommended</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Meta Description <span className="text-gray-500 font-normal">(shows in Google search results)</span></label>
          <textarea rows={3} value={seo.siteDescription} onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })} className="input resize-none" placeholder="Discover Glomix premium natural cosmetics..." />
          <p className="text-xs text-gray-500 mt-1">{seo.siteDescription.length}/160 characters recommended</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Keywords <span className="text-gray-500 font-normal">(comma separated)</span></label>
          <textarea rows={3} value={seo.siteKeywords.join(', ')} onChange={(e) => setSeo({ ...seo, siteKeywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) })} className="input resize-none" placeholder="glomix, natural skincare, face cream, soap india..." />
        </div>
        <div>
          <ImageUpload
            label="OG / Social Share Image"
            hint="Recommended: 1200×628px"
            aspect="aspect-[1200/628]"
            value={seo.ogImage ?? ''}
            onChange={url => setSeo({ ...seo, ogImage: url })}
          />
          <p className="text-xs text-gray-500 mt-1.5">Shown when shared on WhatsApp, Facebook, Twitter etc.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Twitter Handle</label>
          <input type="text" value={seo.twitterHandle ?? ''} onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })} className="input" placeholder="@glomixbeauty" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Google Site Verification</label>
          <input type="text" value={seo.googleVerification ?? ''} onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })} className="input font-mono text-sm" placeholder="Paste the content value from Google Search Console" />
          <p className="text-xs text-gray-500 mt-1">Found in Google Search Console → Settings → Ownership Verification</p>
        </div>
      </div>

      <div className="card p-4 text-sm text-gray-400" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
        <p className="font-medium text-gray-500 mb-2">💡 SEO Tips for Glomix</p>
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>Keep title under 60 characters for full display in Google</li>
          <li>Meta description 150–160 characters is ideal</li>
          <li>Use location keywords: "natural soap India", "face cream Delhi" etc.</li>
          <li>Each product has its own SEO fields in the Products section</li>
          <li>Submit your sitemap at <span className="text-gray-500">/sitemap.xml</span> to Google Search Console</li>
        </ul>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
        <Save size={16} />
        {saving ? 'Saving...' : 'Save SEO Settings'}
      </button>
    </div>
  );
}
