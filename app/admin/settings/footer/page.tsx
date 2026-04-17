'use client';
import { useEffect, useState } from 'react';
import { FileText, Save, Plus, Trash2, GripVertical, Link as LinkIcon } from 'lucide-react';
import { apiGet, apiPut } from '../../../../lib/api';
import { ISiteSettings, IFooterColumn, IFooterPolicyLink } from '../../../../types';
import toast from 'react-hot-toast';

const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'twitter', 'youtube', 'pinterest', 'whatsapp'] as const;

export default function AdminFooterPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State
  const [footerColumns, setFooterColumns] = useState<IFooterColumn[]>([]);
  const [policyLinks, setPolicyLinks] = useState<IFooterPolicyLink[]>([]);
  const [footerCopyright, setFooterCopyright] = useState('');
  const [footerDescription, setFooterDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'columns' | 'contact' | 'policy'>('columns');

  useEffect(() => {
    apiGet<ISiteSettings>('/settings').then((s) => {
      setFooterColumns(s?.footerColumns ?? []);
      setPolicyLinks(s?.footerPolicyLinks ?? []);
      setFooterCopyright(s?.footerCopyright ?? '');
      setFooterDescription(s?.footerDescription ?? '');
      setContactEmail(s?.contactEmail ?? '');
      setContactPhone(s?.contactPhone ?? '');
      setContactAddress(s?.contactAddress ?? '');
      setSocialLinks(s?.socialLinks ?? {});
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/admin/settings/footer', {
        footerColumns,
        footerCopyright,
        footerDescription,
        socialLinks,
        contactEmail,
        contactPhone,
        contactAddress,
      });
      await apiPut('/admin/settings/content', { footerPolicyLinks: policyLinks });
      toast.success('Footer settings saved!');
    } catch { toast.error('Failed to save footer settings'); }
    finally { setSaving(false); }
  };

  // Footer column helpers
  const addColumn = () => setFooterColumns(c => [...c, { title: 'New Column', links: [] }]);
  const removeColumn = (i: number) => setFooterColumns(c => c.filter((_, idx) => idx !== i));
  const updateColumnTitle = (i: number, title: string) =>
    setFooterColumns(c => c.map((col, idx) => idx === i ? { ...col, title } : col));
  const addLink = (colIdx: number) =>
    setFooterColumns(c => c.map((col, i) => i === colIdx ? { ...col, links: [...col.links, { label: '', url: '' }] } : col));
  const removeLink = (colIdx: number, linkIdx: number) =>
    setFooterColumns(c => c.map((col, i) => i === colIdx ? { ...col, links: col.links.filter((_, j) => j !== linkIdx) } : col));
  const updateLink = (colIdx: number, linkIdx: number, field: 'label' | 'url', value: string) =>
    setFooterColumns(c => c.map((col, i) => i === colIdx ? {
      ...col,
      links: col.links.map((link, j) => j === linkIdx ? { ...link, [field]: value } : link)
    } : col));

  // Policy link helpers
  const addPolicyLink = () => setPolicyLinks(p => [...p, { label: '', url: '', order: p.length }]);
  const removePolicyLink = (i: number) => setPolicyLinks(p => p.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, order: idx })));
  const updatePolicyLink = (i: number, field: 'label' | 'url', value: string) =>
    setPolicyLinks(p => p.map((link, idx) => idx === i ? { ...link, [field]: value } : link));

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'columns', label: 'Link Columns' },
    { id: 'contact', label: 'Contact & Social' },
    { id: 'policy', label: 'Policy Links' },
  ] as const;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <FileText size={22} /> Footer Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage footer columns, contact info, social links, and policy links</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${tab === t.id ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Link Columns */}
      {tab === 'columns' && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Footer Copyright Text</label>
              <input
                type="text"
                value={footerCopyright}
                onChange={e => setFooterCopyright(e.target.value)}
                className="input"
                placeholder="© 2025 Glomix. All rights reserved."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Footer Brand Description</label>
              <textarea
                rows={2}
                value={footerDescription}
                onChange={e => setFooterDescription(e.target.value)}
                className="input resize-none"
                placeholder="Your store tagline for the footer brand column..."
              />
            </div>
          </div>

          <div className="space-y-3">
            {footerColumns.map((col, colIdx) => (
              <div key={colIdx} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <GripVertical size={16} className="text-gray-400" />
                  <input
                    type="text"
                    value={col.title}
                    onChange={e => updateColumnTitle(colIdx, e.target.value)}
                    className="input flex-1 font-semibold"
                    placeholder="Column Title"
                  />
                  <button onClick={() => removeColumn(colIdx)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="space-y-2 ml-6">
                  {col.links.map((link, linkIdx) => (
                    <div key={linkIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={e => updateLink(colIdx, linkIdx, 'label', e.target.value)}
                        className="input flex-1 text-sm"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={e => updateLink(colIdx, linkIdx, 'url', e.target.value)}
                        className="input flex-1 text-sm font-mono"
                        placeholder="/page-url"
                      />
                      <button onClick={() => removeLink(colIdx, linkIdx)} className="p-1.5 rounded text-red-400 hover:bg-red-50 shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addLink(colIdx)} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mt-1 transition-colors">
                    <Plus size={12} /> Add link
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addColumn} className="btn-outline gap-2 text-sm">
            <Plus size={15} /> Add Column
          </button>
        </div>
      )}

      {/* Tab: Contact & Social */}
      {tab === 'contact' && (
        <div className="space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Contact Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="input" placeholder="hello@glomix.in" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
              <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="input" placeholder="+91 9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
              <textarea rows={2} value={contactAddress} onChange={e => setContactAddress(e.target.value)} className="input resize-none" placeholder="123 Main St, Mumbai, India" />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <LinkIcon size={14} /> Social Media Links
            </h2>
            {SOCIAL_PLATFORMS.map(platform => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 capitalize">{platform}</label>
                <input
                  type="url"
                  value={socialLinks[platform] ?? ''}
                  onChange={e => setSocialLinks(p => ({ ...p, [platform]: e.target.value }))}
                  className="input font-mono text-sm"
                  placeholder={`https://${platform}.com/glomixbeauty`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Policy Links */}
      {tab === 'policy' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">These links appear in the bottom bar of the footer.</p>
          <div className="space-y-2">
            {policyLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={link.label}
                  onChange={e => updatePolicyLink(i, 'label', e.target.value)}
                  className="input flex-1 text-sm"
                  placeholder="Label (e.g. Privacy Policy)"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={e => updatePolicyLink(i, 'url', e.target.value)}
                  className="input flex-1 text-sm font-mono"
                  placeholder="/privacy-policy"
                />
                <button onClick={() => removePolicyLink(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addPolicyLink} className="btn-outline gap-2 text-sm">
            <Plus size={15} /> Add Policy Link
          </button>
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Footer Settings'}
      </button>
    </div>
  );
}
