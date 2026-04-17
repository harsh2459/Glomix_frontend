'use client';
import { useState, useEffect, useCallback } from 'react';
import { Palette, RotateCcw, Save, Eye, Monitor, Smartphone, Check, Sparkles, Sun, Moon } from 'lucide-react';
import { apiGet, apiPut } from '../../../../lib/api';
import { ISiteSettings, IThemeSettings } from '../../../../types';
import toast from 'react-hot-toast';
import { cn } from '../../../../lib/utils';

// ── Google Fonts ──────────────────────────────────────────────
const BODY_FONTS    = ['Inter', 'DM Sans', 'Nunito', 'Lato', 'Poppins', 'Outfit', 'Raleway', 'Montserrat'];
const HEADING_FONTS = ['Playfair Display', 'Cormorant Garamond', 'Merriweather', 'Josefin Sans', 'Cinzel', 'DM Serif Display', 'Libre Baskerville'];

// ── Preset Themes ─────────────────────────────────────────────
const PRESETS: { name: string; emoji: string; theme: Partial<IThemeSettings> }[] = [
  {
    name: 'Classic White',
    emoji: '🤍',
    theme: {
      primaryColor: '#111827', secondaryColor: '#374151', accentColor: '#6B7280',
      backgroundColor: '#FFFFFF', surfaceColor: '#F9FAFB', textColor: '#111827', mutedColor: '#6B7280',
      fontFamily: 'Inter', headingFontFamily: 'Playfair Display', borderRadius: '0.75rem', buttonStyle: 'rounded',
    },
  },
  {
    name: 'Rose Gold',
    emoji: '🌹',
    theme: {
      primaryColor: '#9F1239', secondaryColor: '#BE123C', accentColor: '#E11D48',
      backgroundColor: '#FFF1F2', surfaceColor: '#FFE4E6', textColor: '#1F1F1F', mutedColor: '#9F1239',
      fontFamily: 'Lato', headingFontFamily: 'Cormorant Garamond', borderRadius: '1rem', buttonStyle: 'pill',
    },
  },
  {
    name: 'Forest Green',
    emoji: '🌿',
    theme: {
      primaryColor: '#166534', secondaryColor: '#15803D', accentColor: '#16A34A',
      backgroundColor: '#F0FDF4', surfaceColor: '#DCFCE7', textColor: '#14532D', mutedColor: '#4ADE80',
      fontFamily: 'Nunito', headingFontFamily: 'Playfair Display', borderRadius: '0.75rem', buttonStyle: 'rounded',
    },
  },
  {
    name: 'Midnight',
    emoji: '🌙',
    theme: {
      primaryColor: '#6366F1', secondaryColor: '#7C3AED', accentColor: '#8B5CF6',
      backgroundColor: '#0F0F1A', surfaceColor: '#1A1A2E', textColor: '#F0F0FF', mutedColor: '#8B8BA8',
      fontFamily: 'DM Sans', headingFontFamily: 'Josefin Sans', borderRadius: '0.5rem', buttonStyle: 'rounded',
    },
  },
  {
    name: 'Golden Hour',
    emoji: '✨',
    theme: {
      primaryColor: '#92400E', secondaryColor: '#B45309', accentColor: '#D97706',
      backgroundColor: '#FFFBEB', surfaceColor: '#FEF3C7', textColor: '#1C1917', mutedColor: '#92400E',
      fontFamily: 'Outfit', headingFontFamily: 'Cormorant Garamond', borderRadius: '0.5rem', buttonStyle: 'sharp',
    },
  },
  {
    name: 'Ocean Blue',
    emoji: '🌊',
    theme: {
      primaryColor: '#0C4A6E', secondaryColor: '#075985', accentColor: '#0284C7',
      backgroundColor: '#F0F9FF', surfaceColor: '#E0F2FE', textColor: '#0C4A6E', mutedColor: '#0284C7',
      fontFamily: 'Poppins', headingFontFamily: 'Merriweather', borderRadius: '0.75rem', buttonStyle: 'rounded',
    },
  },
];

// ── Color input row ───────────────────────────────────────────
function ColorRow({
  label, desc, value, onChange,
}: { label: string; desc: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* Swatch */}
        <label className="relative cursor-pointer">
          <div
            className="w-9 h-9 rounded-lg border-2 border-white shadow-md ring-1 ring-gray-200 transition-transform hover:scale-110"
            style={{ background: value }}
          />
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-24 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono text-gray-700 bg-white focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          maxLength={9}
        />
      </div>
    </div>
  );
}

// ── Live preview mini-site ────────────────────────────────────
function LivePreview({ theme, device }: { theme: IThemeSettings; device: 'desktop' | 'mobile' }) {
  const btnRadius =
    theme.buttonStyle === 'pill' ? '999px' :
    theme.buttonStyle === 'sharp' ? '2px' :
    theme.borderRadius;

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 mx-auto',
        device === 'mobile' ? 'max-w-[320px]' : 'w-full'
      )}
      style={{ background: theme.backgroundColor, fontFamily: theme.fontFamily }}
    >
      {/* Fake nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: theme.surfaceColor, borderColor: 'rgba(0,0,0,0.07)' }}>
        <span style={{ fontFamily: theme.headingFontFamily, color: theme.primaryColor, fontWeight: 700, fontSize: '1rem' }}>Glomix</span>
        {device !== 'mobile' && (
          <div className="flex gap-4">
            {['Products', 'Blog', 'About'].map(l => (
              <span key={l} style={{ color: theme.mutedColor, fontSize: '0.75rem' }}>{l}</span>
            ))}
          </div>
        )}
        <button
          style={{ background: theme.primaryColor, color: '#fff', padding: '4px 12px', borderRadius: btnRadius, fontSize: '0.7rem', fontWeight: 600, border: 'none' }}
        >
          Shop
        </button>
      </div>

      {/* Hero */}
      <div className="px-5 py-6" style={{ background: `linear-gradient(135deg, ${theme.surfaceColor}, ${theme.backgroundColor})` }}>
        <p style={{ color: theme.mutedColor, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>✨ Premium Natural Beauty</p>
        <h2 style={{ fontFamily: theme.headingFontFamily, color: theme.textColor, fontSize: device === 'mobile' ? '1.4rem' : '1.7rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>
          Glow with<br />Pure Nature
        </h2>
        <p style={{ color: theme.mutedColor, fontSize: '0.72rem', marginBottom: '14px', lineHeight: 1.5 }}>
          Handcrafted skincare made with love & natural ingredients.
        </p>
        <div className="flex gap-2">
          <button style={{ background: theme.primaryColor, color: '#fff', padding: '7px 16px', borderRadius: btnRadius, fontSize: '0.72rem', fontWeight: 600, border: 'none' }}>
            Shop Now →
          </button>
          <button style={{ background: 'transparent', color: theme.primaryColor, padding: '7px 14px', borderRadius: btnRadius, fontSize: '0.72rem', fontWeight: 600, border: `1.5px solid ${theme.primaryColor}` }}>
            Best Sellers
          </button>
        </div>
      </div>

      {/* Product cards */}
      <div className="px-4 py-4">
        <p style={{ fontFamily: theme.headingFontFamily, color: theme.textColor, fontWeight: 700, fontSize: '0.9rem', marginBottom: '10px' }}>Best Sellers</p>
        <div className={cn('grid gap-2', device === 'mobile' ? 'grid-cols-2' : 'grid-cols-3')}>
          {['Face Cream', 'Glow Serum', 'Body Scrub'].slice(0, device === 'mobile' ? 2 : 3).map(p => (
            <div key={p} className="rounded-lg overflow-hidden" style={{ background: theme.surfaceColor, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="h-16" style={{ background: `linear-gradient(135deg, ${theme.accentColor}22, ${theme.primaryColor}22)` }} />
              <div className="p-2">
                <p style={{ color: theme.textColor, fontSize: '0.65rem', fontWeight: 600 }}>{p}</p>
                <p style={{ color: theme.primaryColor, fontSize: '0.65rem', fontWeight: 700 }}>₹499</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminThemePage() {
  const [original,     setOriginal]   = useState<IThemeSettings | null>(null);
  const [theme,        setTheme]      = useState<IThemeSettings | null>(null);
  const [announcment,  setAnn]        = useState<ISiteSettings['announcementBar'] | null>(null);
  const [loading,      setLoading]    = useState(true);
  const [saving,       setSaving]     = useState(false);
  const [device,       setDevice]     = useState<'desktop' | 'mobile'>('desktop');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [tab,          setTab]        = useState<'colors' | 'typography' | 'announcement'>('colors');

  useEffect(() => {
    apiGet<ISiteSettings>('/settings').then(s => {
      setOriginal(s?.theme);
      setTheme(s?.theme);
      setAnn(s?.announcementBar);
    }).finally(() => setLoading(false));
  }, []);

  const update = useCallback((key: keyof IThemeSettings, val: string) => {
    setTheme(prev => prev ? { ...prev, [key]: val } : prev);
    setActivePreset(null);
  }, []);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTheme(prev => prev ? { ...prev, ...preset.theme } : prev);
    setActivePreset(preset.name);
  };

  const reset = () => {
    setTheme(original);
    setActivePreset(null);
  };

  const handleSave = async () => {
    if (!theme) return;
    setSaving(true);
    try {
      await apiPut('/admin/settings/theme', theme);
      if (announcment) await apiPut('/admin/settings/announcement', announcment);
      setOriginal(theme);
      toast.success('Theme saved! Changes live on site.');
    } catch { toast.error('Failed to save theme'); }
    finally { setSaving(false); }
  };

  const hasChanges = JSON.stringify(theme) !== JSON.stringify(original);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
          <p className="text-sm text-gray-400">Loading theme settings...</p>
        </div>
      </div>
    );
  }
  if (!theme) return <p className="text-gray-400">Could not load settings.</p>;

  const colorGroups: { key: keyof IThemeSettings; label: string; desc: string }[] = [
    { key: 'primaryColor',    label: 'Primary Color',    desc: 'Buttons, links, active states' },
    { key: 'secondaryColor',  label: 'Secondary Color',  desc: 'Hover states, gradients' },
    { key: 'accentColor',     label: 'Accent / Muted',   desc: 'Icons, subtle highlights' },
    { key: 'backgroundColor', label: 'Background',       desc: 'Main page background' },
    { key: 'surfaceColor',    label: 'Surface',          desc: 'Cards, panels, sections' },
    { key: 'textColor',       label: 'Text Color',       desc: 'Primary body text' },
    { key: 'mutedColor',      label: 'Muted Text',       desc: 'Secondary, placeholder text' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2 text-gray-900">
            <Palette size={22} className="text-gray-500" />
            Theme &amp; Appearance
          </h1>
          <p className="text-gray-400 text-sm mt-1">Customize colors, fonts, and style — changes apply instantly to the storefront</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <RotateCcw size={14} /> Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving...</>
            ) : (
              <><Save size={14} />Save Theme</>
            )}
          </button>
        </div>
      </div>

      {/* ── Preset themes ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Quick Presets</h2>
          <span className="text-xs text-gray-400 ml-1">— one click to apply a full theme</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-medium transition-all hover:shadow-md',
                activePreset === preset.name
                  ? 'border-gray-800 bg-gray-50'
                  : 'border-gray-100 bg-white hover:border-gray-300'
              )}
            >
              {activePreset === preset.name && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </span>
              )}
              {/* Color dots */}
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: preset.theme.primaryColor }} />
                <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: preset.theme.backgroundColor }} />
                <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: preset.theme.accentColor }} />
              </div>
              <span className="text-gray-600 leading-tight text-center">{preset.emoji} {preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout: editor + preview ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Left: Editor tabs ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {([
              { id: 'colors', label: 'Colors' },
              { id: 'typography', label: 'Typography' },
              { id: 'announcement', label: 'Announcement Bar' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 py-3 text-sm font-medium transition-all',
                  tab === t.id
                    ? 'text-gray-900 border-b-2 border-gray-800 bg-gray-50'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* Colors tab */}
            {tab === 'colors' && (
              <div className="space-y-1">
                {colorGroups.map(({ key, label, desc }) => (
                  <ColorRow
                    key={key}
                    label={label}
                    desc={desc}
                    value={String(theme[key])}
                    onChange={v => update(key, v)}
                  />
                ))}
              </div>
            )}

            {/* Typography tab */}
            {tab === 'typography' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Body Font</label>
                    <p className="text-xs text-gray-400 mb-2">Used for paragraphs, descriptions, UI text</p>
                    <div className="grid grid-cols-2 gap-2">
                      {BODY_FONTS.map(f => (
                        <button
                          key={f}
                          onClick={() => update('fontFamily', f)}
                          className={cn(
                            'px-3 py-2 rounded-lg border text-sm text-left transition-all',
                            theme.fontFamily === f
                              ? 'border-gray-800 bg-gray-50 text-gray-900 font-medium'
                              : 'border-gray-100 text-gray-500 hover:border-gray-300'
                          )}
                          style={{ fontFamily: f }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Heading Font</label>
                    <p className="text-xs text-gray-400 mb-2">Used for page titles and section headings</p>
                    <div className="grid grid-cols-2 gap-2">
                      {HEADING_FONTS.map(f => (
                        <button
                          key={f}
                          onClick={() => update('headingFontFamily', f)}
                          className={cn(
                            'px-3 py-2 rounded-lg border text-sm text-left transition-all',
                            theme.headingFontFamily === f
                              ? 'border-gray-800 bg-gray-50 text-gray-900 font-medium'
                              : 'border-gray-100 text-gray-500 hover:border-gray-300'
                          )}
                          style={{ fontFamily: f }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Border Radius</label>
                      <div className="space-y-2">
                        {[
                          { label: 'Sharp', value: '2px' },
                          { label: 'Slight', value: '0.375rem' },
                          { label: 'Rounded', value: '0.75rem' },
                          { label: 'Large', value: '1.25rem' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => update('borderRadius', opt.value)}
                            className={cn(
                              'w-full px-3 py-2 border text-sm text-left flex items-center gap-2 transition-all',
                              theme.borderRadius === opt.value
                                ? 'border-gray-800 bg-gray-50 text-gray-900 font-medium'
                                : 'border-gray-100 text-gray-500 hover:border-gray-300'
                            )}
                            style={{ borderRadius: opt.value }}
                          >
                            <span className="w-6 h-4 border-2 border-current inline-block shrink-0" style={{ borderRadius: opt.value }} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Style</label>
                      <div className="space-y-2">
                        {([
                          { label: 'Sharp', value: 'sharp' as const },
                          { label: 'Rounded', value: 'rounded' as const },
                          { label: 'Pill', value: 'pill' as const },
                        ]).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => update('buttonStyle', opt.value)}
                            className={cn(
                              'w-full px-3 py-1.5 border text-xs font-semibold transition-all',
                              theme.buttonStyle === opt.value
                                ? 'border-gray-800 bg-gray-800 text-white'
                                : 'border-gray-200 text-gray-600 hover:border-gray-400'
                            )}
                            style={{
                              borderRadius:
                                opt.value === 'pill' ? '999px' :
                                opt.value === 'sharp' ? '2px' :
                                '0.5rem'
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Announcement bar tab */}
            {tab === 'announcement' && announcment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Enable Announcement Bar</p>
                    <p className="text-xs text-gray-400 mt-0.5">Shows a full-width bar at the top of the store</p>
                  </div>
                  <button
                    onClick={() => setAnn(prev => prev ? { ...prev, isEnabled: !prev.isEnabled } : prev)}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors',
                      announcment.isEnabled ? 'bg-gray-800' : 'bg-gray-200'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                      announcment.isEnabled ? 'translate-x-5' : 'translate-x-0'
                    )} />
                  </button>
                </div>

                {announcment.isEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Announcement Text</label>
                      <input
                        type="text"
                        value={announcment.text}
                        onChange={e => setAnn(prev => prev ? { ...prev, text: e.target.value } : prev)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                        placeholder="🌿 Free shipping on orders above ₹499!"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Link (optional)</label>
                      <input
                        type="text"
                        value={announcment.link ?? ''}
                        onChange={e => setAnn(prev => prev ? { ...prev, link: e.target.value } : prev)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                        placeholder="/products"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Background</label>
                        <div className="flex items-center gap-2">
                          <label className="relative cursor-pointer">
                            <div className="w-9 h-9 rounded-lg border-2 border-white shadow ring-1 ring-gray-200" style={{ background: announcment.backgroundColor }} />
                            <input type="color" value={announcment.backgroundColor} onChange={e => setAnn(prev => prev ? { ...prev, backgroundColor: e.target.value } : prev)} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </label>
                          <input type="text" value={announcment.backgroundColor} onChange={e => setAnn(prev => prev ? { ...prev, backgroundColor: e.target.value } : prev)} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none" maxLength={9} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Color</label>
                        <div className="flex items-center gap-2">
                          <label className="relative cursor-pointer">
                            <div className="w-9 h-9 rounded-lg border-2 border-white shadow ring-1 ring-gray-200" style={{ background: announcment.textColor }} />
                            <input type="color" value={announcment.textColor} onChange={e => setAnn(prev => prev ? { ...prev, textColor: e.target.value } : prev)} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </label>
                          <input type="text" value={announcment.textColor} onChange={e => setAnn(prev => prev ? { ...prev, textColor: e.target.value } : prev)} className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none" maxLength={9} />
                        </div>
                      </div>
                    </div>

                    {/* Announcement preview */}
                    <div className="rounded-lg overflow-hidden border border-gray-100">
                      <div className="px-4 py-2 text-center text-sm" style={{ background: announcment.backgroundColor, color: announcment.textColor }}>
                        {announcment.text || 'Your announcement here'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Eye size={15} className="text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Live Preview</h2>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setDevice('desktop')}
                className={cn('p-1.5 rounded-md transition-all', device === 'desktop' ? 'bg-white shadow text-gray-700' : 'text-gray-400 hover:text-gray-600')}
                title="Desktop"
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={cn('p-1.5 rounded-md transition-all', device === 'mobile' ? 'bg-white shadow text-gray-700' : 'text-gray-400 hover:text-gray-600')}
                title="Mobile"
              >
                <Smartphone size={15} />
              </button>
            </div>
          </div>

          {/* Announcement preview */}
          {announcment?.isEnabled && (
            <div
              className="px-4 py-1.5 text-center text-xs"
              style={{ background: announcment.backgroundColor, color: announcment.textColor }}
            >
              {announcment.text || 'Announcement bar preview'}
            </div>
          )}

          <div className="p-4 bg-gray-50 min-h-[500px] flex items-start justify-center pt-6">
            <LivePreview theme={theme} device={device} />
          </div>

          {/* Color palette summary */}
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Current palette</p>
            <div className="flex gap-1.5">
              {(['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'surfaceColor', 'textColor', 'mutedColor'] as const).map(k => (
                <div
                  key={k}
                  title={`${k}: ${theme[k]}`}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100"
                  style={{ background: String(theme[k]) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Save footer bar ── */}
      {hasChanges && (
        <div className="sticky bottom-4 z-10">
          <div className="bg-gray-900 text-white rounded-xl px-6 py-3 flex items-center justify-between shadow-2xl">
            <p className="text-sm">You have unsaved theme changes</p>
            <div className="flex gap-2">
              <button onClick={reset} className="px-4 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-1.5 rounded-lg bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? <><span className="w-3 h-3 rounded-full border-2 border-gray-400 border-t-gray-800 animate-spin" />Saving</> : <><Save size={13} />Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
