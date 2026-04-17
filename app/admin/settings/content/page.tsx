'use client';
import { useEffect, useState } from 'react';
import { LayoutGrid, Save, Plus, Trash2, GripVertical, Navigation, Sparkles, Mail, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { apiGet, apiPut } from '../../../../lib/api';
import { ISiteSettings, INavLink, IHeroTrustBadge, IUSPItem } from '../../../../types';
import toast from 'react-hot-toast';
import ImageUpload from '../../../../components/ui/ImageUpload';

const USP_ICON_OPTIONS = [
  { value: 'leaf',     label: '🌿 Leaf (Natural)' },
  { value: 'shield',   label: '🛡️ Shield (Safe)' },
  { value: 'truck',    label: '🚚 Truck (Shipping)' },
  { value: 'star',     label: '⭐ Star (Quality)' },
  { value: 'sparkles', label: '✨ Sparkles (Premium)' },
];

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'nav' | 'usp' | 'badges' | 'newsletter'>('nav');

  const [navLinks, setNavLinks] = useState<INavLink[]>([]);
  const [trustBadges, setTrustBadges] = useState<IHeroTrustBadge[]>([]);
  const [uspStrip, setUspStrip] = useState<IUSPItem[]>([]);
  const [newsletterTitle, setNewsletterTitle] = useState('');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState('');

  useEffect(() => {
    apiGet<ISiteSettings>('/settings').then((s) => {
      setNavLinks(s?.navLinks ? [...s.navLinks].sort((a, b) => a.order - b.order) : []);
      setTrustBadges(s?.heroTrustBadges ? [...s.heroTrustBadges].sort((a, b) => a.order - b.order) : []);
      setUspStrip(s?.uspStrip ? [...s.uspStrip].sort((a, b) => a.order - b.order) : []);
      setNewsletterTitle(s?.newsletterTitle ?? '');
      setNewsletterSubtitle(s?.newsletterSubtitle ?? '');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const navWithOrder = navLinks.map((l, i) => ({ ...l, order: i }));
      const badgesWithOrder = trustBadges.map((b, i) => ({ ...b, order: i }));
      const uspWithOrder = uspStrip.map((u, i) => ({ ...u, order: i }));

      await apiPut('/admin/settings/nav', navWithOrder);
      await apiPut('/admin/settings/content', {
        heroTrustBadges: badgesWithOrder,
        uspStrip: uspWithOrder,
        newsletterTitle,
        newsletterSubtitle,
      });
      setNavLinks(navWithOrder);
      setTrustBadges(badgesWithOrder);
      setUspStrip(uspWithOrder);
      toast.success('Content settings saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  // Nav helpers
  const addNav = () => setNavLinks(n => [...n, { label: '', href: '', order: n.length, subLinks: [] }]);
  const removeNav = (i: number) => setNavLinks(n => n.filter((_, idx) => idx !== i));
  const updateNav = (i: number, field: keyof INavLink, val: string) =>
    setNavLinks(n => n.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  // Sub-nav helpers
  const addSubNav = (pIdx: number) => setNavLinks(n => n.map((l, idx) => idx === pIdx ? { ...l, subLinks: [...(l.subLinks || []), { label: '', href: '', order: (l.subLinks || []).length }] } : l));
  const removeSubNav = (pIdx: number, sIdx: number) => setNavLinks(n => n.map((l, idx) => idx === pIdx ? { ...l, subLinks: l.subLinks?.filter((_, sd) => sd !== sIdx) } : l));
  const updateSubNav = (pIdx: number, sIdx: number, field: 'label' | 'href', val: string) => setNavLinks(n => n.map((l, idx) => idx === pIdx ? { ...l, subLinks: l.subLinks?.map((sub, sd) => sd === sIdx ? { ...sub, [field]: val } : sub) } : l));

  // Trust badge helpers
  const addBadge = () => setTrustBadges(b => [...b, { icon: '✨', text: '', order: b.length }]);
  const removeBadge = (i: number) => setTrustBadges(b => b.filter((_, idx) => idx !== i));
  const updateBadge = (i: number, field: 'icon' | 'text', val: string) =>
    setTrustBadges(b => b.map((badge, idx) => idx === i ? { ...badge, [field]: val } : badge));
  const moveBadge = (i: number, dir: -1 | 1) => {
    setTrustBadges(b => {
      const arr = [...b];
      const target = i + dir;
      if (target >= 0 && target < arr.length) {
        [arr[i], arr[target]] = [arr[target], arr[i]];
      }
      return arr;
    });
  };

  // USP helpers
  const addUSP = () => setUspStrip(u => [...u, { iconName: 'leaf', title: '', desc: '', order: u.length }]);
  const removeUSP = (i: number) => setUspStrip(u => u.filter((_, idx) => idx !== i));
  const updateUSP = (i: number, field: keyof IUSPItem, val: string) =>
    setUspStrip(u => u.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  const moveUSP = (i: number, dir: -1 | 1) => {
    setUspStrip(u => {
      const arr = [...u];
      const target = i + dir;
      if (target >= 0 && target < arr.length) {
        [arr[i], arr[target]] = [arr[target], arr[i]];
      }
      return arr;
    });
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'nav', label: 'Navigation', icon: Navigation },
    { id: 'usp', label: 'USP Strip', icon: LayoutGrid },
    { id: 'badges', label: 'Hero Badges', icon: Sparkles },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
  ] as const;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <LayoutGrid size={22} /> Content Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Control your header navigation, homepage USP strip, hero trust badges, and newsletter text
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${tab === t.id ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Navigation Tab */}
      {tab === 'nav' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            These links appear in the main header navigation. Drag to reorder (save to apply order).
          </p>
          <div className="space-y-4">
            {navLinks.map((link, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                
                {/* Parent Link Row */}
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-400 shrink-0 cursor-grab" />
                  <input
                    type="text"
                    value={link.label}
                    onChange={e => updateNav(i, 'label', e.target.value)}
                    className="input flex-1 text-sm bg-gray-50 border-gray-200"
                    placeholder="Parent Label (e.g. All Products)"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={e => updateNav(i, 'href', e.target.value)}
                    className="input flex-1 text-sm font-mono bg-gray-50 border-gray-200"
                    placeholder="/products"
                  />
                  <button onClick={() => removeNav(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {/* Nested Sub-links Area */}
                <div className="pl-6 ml-2 border-l-2 border-indigo-100/50 mt-1 space-y-2">
                   {(link.subLinks || []).map((sub, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 relative">
                        <div className="absolute -left-6 top-1/2 w-4 h-px bg-indigo-100/50"></div>
                        <input
                           type="text"
                           value={sub.label}
                           onChange={e => updateSubNav(i, sIdx, 'label', e.target.value)}
                           className="input flex-1 min-w-0 text-xs bg-white py-1.5"
                           placeholder="Sub Label"
                        />
                        <input
                           type="text"
                           value={sub.href}
                           onChange={e => updateSubNav(i, sIdx, 'href', e.target.value)}
                           className="input flex-1 min-w-0 text-xs font-mono bg-white py-1.5"
                           placeholder="URL Path"
                        />
                        <button onClick={() => removeSubNav(i, sIdx)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                   ))}
                   
                   <button onClick={() => addSubNav(i)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1 transition">
                      <Plus size={12}/> Add Sub-link
                   </button>
                </div>

              </div>
            ))}
          </div>
          <button onClick={addNav} className="btn-outline gap-2 text-sm w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50">
            <Plus size={16} /> Add Parent Link
          </button>

          {navLinks.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-6">
              <p className="text-xs font-medium text-gray-500 mb-2">Structure Preview</p>
              <nav className="flex flex-wrap gap-x-6 gap-y-4">
                {navLinks.map((link, i) => (
                  <div key={i} className="flex flex-col group">
                     <span className="text-sm font-semibold text-gray-800 transition-colors cursor-default mb-1 group-hover:text-indigo-600">
                        {link.label || '(empty)'} {link.subLinks && link.subLinks.length > 0 && '▾'}
                     </span>
                     {link.subLinks && link.subLinks.length > 0 && (
                        <div className="flex flex-col gap-1 pl-2 border-l border-gray-200">
                           {link.subLinks.map((sub, sIdx) => (
                              <span key={sIdx} className="text-xs text-gray-500 hover:text-gray-900 cursor-default">
                                 {sub.label || '(empty)'}
                              </span>
                           ))}
                        </div>
                     )}
                  </div>
                ))}
              </nav>
            </div>
          )}
        </div>
      )}

      {/* USP Strip Tab */}
      {tab === 'usp' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            The 4 value-proposition boxes that appear below the hero banner.
          </p>
          <div className="space-y-4">
            {uspStrip.map((item, i) => (
              <div key={i} className="card p-5 flex flex-col md:flex-row items-start gap-6 border border-gray-100 shadow-sm relative group">
                
                {/* Reorder & Delete Actions */}
                <div className="absolute right-4 top-4 flex flex-col gap-1 items-center">
                  <button onClick={() => removeUSP(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-2" title="Delete">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => moveUSP(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition" title="Move Up">
                    <ArrowUpCircle size={20} />
                  </button>
                  <button onClick={() => moveUSP(i, 1)} disabled={i === uspStrip.length - 1} className="text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition" title="Move Down">
                    <ArrowDownCircle size={20} />
                  </button>
                </div>

                <div className="w-full md:w-40 shrink-0 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Icon / Image</label>
                  <ImageUpload
                    value={item.iconName.startsWith('http') || item.iconName.startsWith('/') || item.iconName.startsWith('data:') ? item.iconName : ''}
                    onChange={url => updateUSP(i, 'iconName', url)}
                    label=""
                    hint=""
                    aspect="aspect-square"
                  />
                  <input
                    type="text"
                    value={item.iconName}
                    onChange={e => updateUSP(i, 'iconName', e.target.value)}
                    className="input text-xs w-full text-center py-1.5 px-2 bg-gray-50"
                    placeholder="or icon name"
                  />
                </div>

                <div className="flex-1 space-y-4 pt-1 pr-12 w-full">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => updateUSP(i, 'title', e.target.value)}
                      className="input w-full text-sm font-medium"
                      placeholder="e.g. 100% Natural"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                    <input
                      type="text"
                      value={item.desc}
                      onChange={e => updateUSP(i, 'desc', e.target.value)}
                      className="input w-full text-sm text-gray-600"
                      placeholder="e.g. Handpicked ingredients"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addUSP} className="btn-outline gap-2 text-sm">
            <Plus size={15} /> Add USP Item
          </button>
        </div>
      )}

      {/* Hero Badges Tab */}
      {tab === 'badges' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Small trust indicators shown below the hero CTA buttons (e.g. 🌿 100% Natural, 🐰 Cruelty Free).
          </p>
          <div className="space-y-4">
            {trustBadges.map((badge, i) => (
              <div key={i} className="card p-5 flex flex-col md:flex-row items-start gap-6 border border-gray-100 shadow-sm relative group">
                
                {/* Reorder & Delete Actions */}
                <div className="absolute right-4 top-4 flex flex-col gap-1 items-center">
                  <button onClick={() => removeBadge(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-2" title="Delete">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => moveBadge(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition" title="Move Up">
                    <ArrowUpCircle size={20} />
                  </button>
                  <button onClick={() => moveBadge(i, 1)} disabled={i === trustBadges.length - 1} className="text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition" title="Move Down">
                    <ArrowDownCircle size={20} />
                  </button>
                </div>

                <div className="w-full md:w-40 shrink-0 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Icon / Image</label>
                  <ImageUpload
                    value={badge.icon?.startsWith('http') || badge.icon?.startsWith('/') || badge.icon?.startsWith('data:') ? badge.icon : ''}
                    onChange={url => updateBadge(i, 'icon', url)}
                    label=""
                    hint=""
                    aspect="aspect-square"
                  />
                  <input
                    type="text"
                    value={badge.icon}
                    onChange={e => updateBadge(i, 'icon', e.target.value)}
                    className="input text-xs w-full text-center py-1.5 px-2 bg-gray-50"
                    placeholder="or icon/emoji"
                  />
                </div>

                <div className="flex-1 space-y-4 pt-1 pr-12 w-full">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Badge Text</label>
                    <input
                      type="text"
                      value={badge.text}
                      onChange={e => updateBadge(i, 'text', e.target.value)}
                      className="input w-full text-sm font-medium"
                      placeholder="e.g. Cruelty Free"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addBadge} className="btn-outline gap-2 text-sm w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 mt-4">
            <Plus size={16} /> Add Hero Badge
          </button>

          {trustBadges.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-6">
              <p className="text-xs font-medium text-gray-500 mb-2">Preview Layout</p>
              <div className="flex flex-wrap gap-6">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <span className="flex items-center justify-center">
                      {badge.icon?.startsWith('http') || badge.icon?.startsWith('/') || badge.icon?.startsWith('data:') ? (
                        <img src={badge.icon} alt={badge.text} className="w-5 h-5 object-contain" />
                      ) : badge.icon}
                    </span>
                    <span>{badge.text || '(empty)'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Newsletter Tab */}
      {tab === 'newsletter' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-400">Edit the newsletter signup section text shown on the homepage.</p>
          <div className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Headline</label>
              <input
                type="text"
                value={newsletterTitle}
                onChange={e => setNewsletterTitle(e.target.value)}
                className="input"
                placeholder="Get 10% Off Your First Order"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Subtitle</label>
              <textarea
                rows={3}
                value={newsletterSubtitle}
                onChange={e => setNewsletterSubtitle(e.target.value)}
                className="input resize-none"
                placeholder="Subscribe to our newsletter for exclusive offers..."
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 p-8 text-center bg-gray-50">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Preview</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{newsletterTitle || 'Headline here'}</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">{newsletterSubtitle || 'Subtitle here...'}</p>
            <div className="flex gap-2 max-w-sm mx-auto mt-4">
              <input type="email" className="input flex-1 text-sm" placeholder="Enter your email" readOnly />
              <button className="btn-primary text-sm py-2 px-4">Subscribe</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
        <Save size={16} />
        {saving ? 'Saving...' : 'Save Content Settings'}
      </button>
    </div>
  );
}
