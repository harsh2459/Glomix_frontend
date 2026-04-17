'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Copy, ChevronDown, ChevronRight, Monitor, Smartphone, RotateCcw } from 'lucide-react';
import { apiGet, apiPut } from '../../../../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../../../../lib/utils';
import { ITemplateField } from '../../../../../types';

// ── variables grouped by category ─────────────────────────
const VARIABLE_GROUPS = [
  {
    group: '📦 Product Info',
    vars: [
      { token: '{{name}}',              desc: 'Product name' },
      { token: '{{shortDescription}}',  desc: 'Short description' },
      { token: '{{description}}',       desc: 'Full description (HTML-safe)' },
      { token: '{{category}}',          desc: 'Category name' },
      { token: '{{sku}}',               desc: 'SKU code' },
      { token: '{{rating}}',            desc: 'Average rating (e.g. 4.7)' },
      { token: '{{reviewCount}}',       desc: 'Number of reviews' },
      { token: '{{stock}}',             desc: 'Stock quantity' },
      { token: '{{tags}}',              desc: 'Tags (comma-separated)' },
    ],
  },
  {
    group: '💰 Pricing',
    vars: [
      { token: '{{price}}',             desc: 'Current selling price (₹299)' },
      { token: '{{originalPrice}}',     desc: 'Original price before sale (₹499)' },
      { token: '{{discount}}',          desc: 'Discount percent (e.g. 40%)' },
      { token: '{{currency}}',          desc: 'Currency symbol (₹)' },
    ],
  },
  {
    group: '🖼 Images',
    vars: [
      { token: '{{image}}',             desc: 'First image URL' },
      { token: '{{image2}}',            desc: 'Second image URL' },
      { token: '{{image3}}',            desc: 'Third image URL' },
      { token: '{{image4}}',            desc: 'Fourth image URL' },
      { token: '{{allImages}}',         desc: 'JSON array of all image URLs' },
    ],
  },
  {
    group: '🧩 Custom Fields',
    vars: [
      { token: '{{customFields.KEY}}',  desc: 'Replace KEY with your field key (e.g. net_weight)' },
    ],
  },
  {
    group: '⚙️ Reactive Blocks',
    vars: [
      { token: '<!-- GALLERY -->',      desc: 'Full image gallery with lightbox' },
      { token: '<!-- CART -->',         desc: 'Add to cart (qty + button + wishlist)' },
      { token: '<!-- VARIANTS -->',     desc: 'Variant selector (size, color, etc.)' },
      { token: '<!-- SPECS -->',        desc: 'Key specs grid' },
      { token: '<!-- TABS -->',         desc: 'Description / Details / Ingredients tabs' },
      { token: '<!-- RELATED -->',      desc: 'Related products row' },
      { token: '<!-- TRUST -->',        desc: 'Free shipping / Authentic / Returns strip' },
    ],
  },
];

// ── starter template ───────────────────────────────────────
const STARTER_TEMPLATE = `<div class="bg-white">

  <!-- top: image + info -->
  <div class="container mx-auto px-4 py-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">

      <!-- images -->
      <div>
        <!-- GALLERY -->
      </div>

      <!-- info -->
      <div class="space-y-6">
        <p class="text-sm text-gray-500 uppercase tracking-widest font-semibold">{{category}}</p>

        <h1 class="text-3xl font-bold text-gray-900">{{name}}</h1>

        <!-- rating -->
        <div class="flex items-center gap-2">
          <span class="text-yellow-400 text-lg">★★★★★</span>
          <span class="text-sm text-gray-600">{{rating}} ({{reviewCount}} reviews)</span>
        </div>

        <!-- price -->
        <div class="flex items-baseline gap-3">
          <span class="text-3xl font-bold text-gray-900">{{price}}</span>
          <span class="text-lg text-gray-400 line-through">{{originalPrice}}</span>
          <span class="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded">Save {{discount}}</span>
        </div>

        <p class="text-gray-600 leading-relaxed">{{shortDescription}}</p>

        <!-- variants & cart -->
        <!-- VARIANTS -->
        <!-- CART -->

        <!-- trust -->
        <!-- TRUST -->
      </div>
    </div>
  </div>

  <!-- specs + tabs -->
  <div class="container mx-auto px-4 pb-16">
    <!-- SPECS -->
    <!-- TABS -->
  </div>

  <!-- related -->
  <!-- RELATED -->

</div>`;

// ── mock data for preview ──────────────────────────────────
const MOCK: Record<string, string> = {
  '{{name}}':             'Rose &amp; Sandalwood Bar Soap',
  '{{shortDescription}}': 'A handcrafted cold-pressed soap for glowing, healthy skin.',
  '{{description}}':      '<p>Our Rose &amp; Sandalwood Soap is carefully crafted using traditional cold-press methods...</p>',
  '{{category}}':         'Face Care',
  '{{sku}}':              'SKU-SOAP-001',
  '{{rating}}':           '4.7',
  '{{reviewCount}}':      '248',
  '{{stock}}':            '24',
  '{{tags}}':             'soap, natural, rose, anti-aging',
  '{{price}}':            '₹299',
  '{{originalPrice}}':    '₹499',
  '{{discount}}':         '40%',
  '{{currency}}':         '₹',
  '{{image}}':            'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80',
  '{{image2}}':           'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
  '{{image3}}':           'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80',
  '{{image4}}':           'https://images.unsplash.com/photo-1571942676516-bcab84649e44?w=600&q=80',
  '{{allImages}}':        '["https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80"]',
  '{{customFields.net_weight}}': '100 grams',
  '{{customFields.skin_type}}':  'All Skin Types',
  '{{customFields.scent}}':      'Rose &amp; Sandalwood',
};

const REACTIVE_REPLACEMENTS: Record<string, string> = {
  '<!-- GALLERY -->': `
    <div style="background:linear-gradient(135deg,#fce7f3,#fdf2f8);border-radius:16px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#d946ef;border:2px dashed #f9a8d4">
      <div style="font-size:40px">🖼</div>
      <div style="font-size:13px;font-weight:600;opacity:0.7">Image Gallery (live on store)</div>
      <img src="https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;opacity:0.3" onerror="this.style.display='none'" />
    </div>`,
  '<!-- CART -->': `
    <div style="display:flex;gap:10px;margin-top:8px">
      <div style="display:flex;border:2px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <button style="padding:8px 14px;font-size:14px;background:#f9fafb;border:none;cursor:pointer">−</button>
        <span style="padding:8px 14px;font-weight:700;font-size:14px">1</span>
        <button style="padding:8px 14px;font-size:14px;background:#f9fafb;border:none;cursor:pointer">+</button>
      </div>
      <button style="flex:1;background:#111;color:#fff;font-weight:700;font-size:14px;border:none;border-radius:12px;padding:0 20px;cursor:pointer">🛒 Add to Cart</button>
      <button style="width:42px;height:42px;border:2px solid #e5e7eb;border-radius:12px;background:#fff;font-size:16px;cursor:pointer">♡</button>
    </div>`,
  '<!-- VARIANTS -->': `
    <div style="margin-bottom:8px">
      <p style="font-size:12px;font-weight:700;color:#374151;margin-bottom:8px">SIZE:</p>
      <div style="display:flex;gap:8px">
        <button style="padding:6px 16px;border:2px solid #111;border-radius:10px;font-size:13px;font-weight:700;background:#111;color:#fff">100g</button>
        <button style="padding:6px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:13px;font-weight:600;background:#fff">150g</button>
        <button style="padding:6px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:13px;font-weight:600;background:#fff">200g</button>
      </div>
    </div>`,
  '<!-- SPECS -->': `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;padding:16px;background:#f9fafb;border-radius:16px">
      ${[['Net Weight','100g'],['Skin Type','All Types'],['Paraben Free','✓ Yes'],['Cruelty Free','✓ Yes'],['Scent','Rose'],['Format','Bar']].map(([k,v]) =>
        `<div style="background:#fff;border-radius:10px;padding:10px 12px;border:1px solid #f3f4f6"><p style="font-size:10px;color:#9ca3af;margin:0 0 2px">${k}</p><p style="font-size:13px;font-weight:700;color:#111;margin:0">${v}</p></div>`
      ).join('')}
    </div>`,
  '<!-- TABS -->': `
    <div style="margin-top:20px">
      <div style="display:flex;border-bottom:2px solid #e5e7eb;margin-bottom:16px">
        <button style="padding:10px 18px;font-size:13px;font-weight:700;color:#111;border-bottom:2px solid #111;margin-bottom:-2px;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer">Description</button>
        <button style="padding:10px 18px;font-size:13px;font-weight:600;color:#9ca3af;background:none;border:none;cursor:pointer">Ingredients</button>
        <button style="padding:10px 18px;font-size:13px;font-weight:600;color:#9ca3af;background:none;border:none;cursor:pointer">How to Use</button>
      </div>
      <p style="font-size:14px;line-height:1.7;color:#374151">Our Rose & Sandalwood Soap is carefully crafted using traditional cold-press methods to preserve all the natural goodness. <strong>Suitable for all skin types</strong> including sensitive skin.</p>
    </div>`,
  '<!-- RELATED -->': `
    <div style="padding:40px 0;border-top:1px solid #f3f4f6">
      <h2 style="font-size:22px;font-weight:800;color:#111;margin:0 0 20px">You May Also Like</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
        ${['Serum','Body Butter','Face Wash'].map(n => `
          <div style="border:1px solid #f3f4f6;border-radius:16px;overflow:hidden">
            <div style="aspect-ratio:1;background:linear-gradient(135deg,#ede9fe,#fdf4ff);display:flex;align-items:center;justify-content:center;font-size:30px">🫙</div>
            <div style="padding:10px"><p style="font-weight:700;font-size:13px;margin:0 0 2px">${n}</p><p style="color:#6b7280;font-size:12px;margin:0">₹349</p></div>
          </div>`).join('')}
      </div>
    </div>`,
  '<!-- TRUST -->': `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:8px">
      ${[['🚚','Free delivery','Above ₹499'],['🛡','100% Authentic','Verified quality'],['↩','7-day returns','Hassle-free']].map(([i,t,s]) =>
        `<div style="text-align:center;padding:10px;background:#f9fafb;border-radius:12px;border:1px solid #f3f4f6"><div style="font-size:18px">${i}</div><p style="font-size:11px;font-weight:700;color:#374151;margin:2px 0 0">${t}</p><p style="font-size:10px;color:#9ca3af;margin:0">${s}</p></div>`
      ).join('')}
    </div>`,
};

function buildPreviewHTML(html: string, customFieldKeys: string[]): string {
  let out = html;

  // Replace mock {{customFields.KEY}} patterns
  customFieldKeys.forEach(key => {
    out = out.replace(new RegExp(`\\{\\{customFields\\.${key}\\}\\}`, 'g'), `<sample-value-for-${key}>`);
  });

  // Replace standard vars
  Object.entries(MOCK).forEach(([token, val]) => {
    out = out.replace(new RegExp(token.replace(/[{}]/g, '\\$&'), 'g'), val);
  });

  // Replace reactive block comments
  Object.entries(REACTIVE_REPLACEMENTS).forEach(([token, val]) => {
    out = out.replace(token, val);
  });

  // Remaining unreplaced {{...}} — highlight in amber
  out = out.replace(/\{\{[^}]+\}\}/g, m =>
    `<mark style="background:#fef3c7;color:#92400e;padding:1px 4px;border-radius:4px;font-size:12px">${m}</mark>`
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #fff; color: #111; }
    .container { max-width: 1200px; margin-left: auto; margin-right: auto; }
  </style>
</head>
<body>
${out}
</body>
</html>`;
}

// ── Line-numbered code editor ──────────────────────────────
function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const lines = value.split('\n').length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newVal);
      requestAnimationFrame(() => {
        if (taRef.current) { taRef.current.selectionStart = taRef.current.selectionEnd = start + 2; }
      });
    }
  };

  const syncScroll = () => {
    if (taRef.current && linesRef.current) {
      linesRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  return (
    <div className="flex-1 min-h-0 flex font-mono text-sm overflow-hidden" style={{ background: '#1e1e2e' }}>
      {/* Line numbers */}
      <div ref={linesRef} className="overflow-hidden flex-none select-none pt-4 pb-4"
        style={{ background: '#181825', minWidth: '3rem', textAlign: 'right', paddingLeft: '8px', paddingRight: '12px', color: '#585b70', fontSize: 12, lineHeight: '21px' }}>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i + 1}>{i + 1}</div>
        ))}
      </div>
      {/* Textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        spellCheck={false}
        className="flex-1 resize-none border-none outline-none p-4"
        style={{
          background: '#1e1e2e', color: '#cdd6f4', fontSize: 13, lineHeight: '21px',
          fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace", caretColor: '#cba6f7',
        }}
      />
    </div>
  );
}

// ── Variable chip ──────────────────────────────────────────
function VarChip({ token, desc, onInsert }: { token: string; desc: string; onInsert: (t: string) => void }) {
  return (
    <button onClick={() => onInsert(token)} title={desc}
      className="flex items-start gap-2 w-full px-2.5 py-2 rounded-lg hover:bg-gray-100 text-left transition group">
      <code className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-mono shrink-0 mt-0.5 group-hover:bg-amber-100 transition">{token}</code>
      <span className="text-[11px] text-gray-500 leading-tight pt-0.5">{desc}</span>
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function PageTemplateEditor() {
  const params = useParams();
  const id = params.id as string;

  const [templateName, setTemplateName]   = useState('');
  const [templateEmoji, setTemplateEmoji] = useState('📦');
  const [templateFields, setTemplateFields] = useState<ITemplateField[]>([]);
  const [html, setHtml]     = useState(STARTER_TEMPLATE);
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scale, setScale]   = useState<'desktop' | 'mobile'>('desktop');
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['📦 Product Info', '⚙️ Reactive Blocks']));
  const [insertPos, setInsertPos] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    apiGet<{ name: string; emoji: string; fields: ITemplateField[]; pageTemplate?: string }>(`/admin/product-templates/${id}`)
      .then(t => {
        setTemplateName(t.name);
        setTemplateEmoji(t.emoji ?? '📦');
        setTemplateFields(t.fields ?? []);
        if (t.pageTemplate) setHtml(t.pageTemplate);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Debounced preview refresh
  const refreshPreview = useCallback((code: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const fieldKeys = templateFields.map(f => f.key);
      setPreviewHtml(buildPreviewHTML(code, fieldKeys));
    }, 400);
  }, [templateFields]);

  useEffect(() => { refreshPreview(html); }, [html, refreshPreview]);

  const handleHtmlChange = (v: string) => { setHtml(v); };

  const insertToken = (token: string) => {
    setHtml(prev => prev + '\n' + token);
    toast.success(`Inserted ${token}`, { duration: 1200 });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut(`/admin/product-templates/${id}/page-template`, { html });
      toast.success('Template saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)', margin: '-24px', background: '#0f0f17' }}>
      {/* ── Top bar ───────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0 z-30"
        style={{ background: '#181825', borderColor: '#313244' }}>
        <div className="flex items-center gap-3">
          <Link href="/admin/product-templates" className="p-1.5 rounded-lg transition" style={{ color: '#cdd6f4' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#313244')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-xs font-mono" style={{ color: '#6c7086' }}>page-template.html</p>
            <h1 className="font-bold text-sm" style={{ color: '#cdd6f4' }}>{templateEmoji} {templateName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Device scale */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#313244' }}>
            <button onClick={() => setScale('desktop')}
              className={cn('p-1.5 rounded transition')} style={{ background: scale === 'desktop' ? '#45475a' : 'transparent', color: '#cdd6f4' }}>
              <Monitor size={14} />
            </button>
            <button onClick={() => setScale('mobile')}
              className={cn('p-1.5 rounded transition')} style={{ background: scale === 'mobile' ? '#45475a' : 'transparent', color: '#cdd6f4' }}>
              <Smartphone size={14} />
            </button>
          </div>
          <button onClick={() => setHtml(STARTER_TEMPLATE)} title="Reset to starter template"
            className="p-1.5 rounded-lg transition flex items-center gap-1.5 text-xs font-medium"
            style={{ background: '#313244', color: '#7f849c' }}>
            <RotateCcw size={13} /> Reset
          </button>
          <Link href={`/admin/product-templates/${id}`}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
            style={{ background: '#313244', color: '#cdd6f4' }}>
            ← Fields
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="text-xs px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 disabled:opacity-60 transition"
            style={{ background: '#7c3aed', color: '#fff' }}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* ── 3-pane layout ─────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Pane 1: Variables sidebar */}
        <div className="w-64 shrink-0 flex flex-col overflow-y-auto border-r" style={{ background: '#181825', borderColor: '#313244' }}>
          <div className="px-3 py-2 border-b" style={{ borderColor: '#313244' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6c7086' }}>Variables & Blocks</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#585b70' }}>Click to insert at cursor</p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {VARIABLE_GROUPS.map(g => {
              const open = openGroups.has(g.group);
              // Add custom field vars dynamically
              const vars = g.group.includes('Custom Fields')
                ? [...g.vars, ...templateFields.map(f => ({ token: `{{customFields.${f.key}}}`, desc: f.label }))]
                : g.vars;
              return (
                <div key={g.group}>
                  <button
                    onClick={() => setOpenGroups(prev => { const n = new Set(prev); n.has(g.group) ? n.delete(g.group) : n.add(g.group); return n; })}
                    className="flex items-center justify-between w-full px-3 py-2 text-left transition"
                    style={{ color: '#cdd6f4' }}>
                    <span className="text-xs font-bold">{g.group}</span>
                    {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  {open && (
                    <div className="pb-1">
                      {vars.map(v => (
                        <VarChip key={v.token} token={v.token} desc={v.desc} onInsert={insertToken} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick snippets */}
          <div className="border-t p-3 space-y-1" style={{ borderColor: '#313244' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#6c7086' }}>Quick Snippets</p>
            {[
              ['Badge', '<span class="badge">{{name}}</span>'],
              ['2-col grid', '<div class="grid grid-cols-2 gap-4">\n  <div></div>\n  <div></div>\n</div>'],
              ['Price row', '<div class="flex gap-2">\n  <span class="text-2xl font-bold">{{price}}</span>\n  <span class="line-through text-gray-400">{{originalPrice}}</span>\n</div>'],
              ['Image full', '<img src="{{image}}" class="w-full rounded-2xl object-cover" alt="{{name}}" />'],
            ].map(([label, snippet]) => (
              <button key={label} onClick={() => insertToken(snippet)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left text-[11px] font-medium transition"
                style={{ color: '#a6adc8' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#313244')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <Copy size={10} className="shrink-0" style={{ color: '#6c7086' }} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Pane 2: Code editor */}
        <div className="flex flex-col" style={{ flex: '0 0 50%', minWidth: 0 }}>
          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b" style={{ background: '#181825', borderColor: '#313244' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#f38ba8' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#fab387' }} />
              <div className="w-2 h-2 rounded-full" style={{ background: '#a6e3a1' }} />
            </div>
            <span className="text-[11px] font-mono" style={{ color: '#6c7086' }}>HTML · {html.split('\n').length} lines</span>
            <button onClick={() => { navigator.clipboard.writeText(html); toast.success('Copied!'); }}
              className="p-1.5 rounded transition" style={{ color: '#6c7086' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#cdd6f4')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6c7086')}>
              <Copy size={12} />
            </button>
          </div>
          <CodeEditor value={html} onChange={handleHtmlChange} />
        </div>

        {/* Pane 3: Live preview */}
        <div className="flex flex-col flex-1 min-w-0 border-l" style={{ borderColor: '#313244' }}>
          <div className="flex items-center justify-between px-4 py-1.5 border-b shrink-0" style={{ background: '#181825', borderColor: '#313244' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6c7086' }}>Live Preview</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#a6e3a1' }} />
              <span className="text-[10px]" style={{ color: '#585b70' }}>Auto-updates</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-200 flex items-start justify-center p-4">
            <div className={cn('bg-white shadow-2xl rounded-xl overflow-hidden transition-all duration-300', scale === 'mobile' ? 'w-[390px]' : 'w-full')} style={{ minHeight: '100%' }}>
              {previewHtml && (
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  className="w-full border-0"
                  style={{ minHeight: '700px', height: '100%' }}
                  title="Page preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
