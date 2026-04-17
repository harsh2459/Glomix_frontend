'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, ShoppingBag, Heart, ChevronRight, Truck, Shield,
  RotateCcw, Minus, Plus, Check, Package, Leaf, ChevronDown,
  ZoomIn, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { IProduct, IProductTemplate, ITemplateField, ILayoutSection, ITemplateLayout } from '../../../../types';
import { formatPrice, getDiscountPercent, cn } from '../../../../lib/utils';
import { useCartStore } from '../../../../stores/cartStore';
import ProductCard from '../../../../components/products/ProductCard';
import toast from 'react-hot-toast';

interface Props { product: IProduct; related: IProduct[]; }

// ── Default layout when no template is set ────────────────
const DEFAULT_LAYOUT: ITemplateLayout = {
  imagePosition: 'left',
  imageRatio: '55-45',
  keySpecFields: [],
  sections: [
    { id: 'image_gallery',       type: 'image_gallery',       enabled: true, order: 0 },
    { id: 'product_header',      type: 'product_header',      enabled: true, order: 1 },
    { id: 'description',         type: 'description',         enabled: true, order: 3, label: 'Description' },
    { id: 'custom_fields_table', type: 'custom_fields_table', enabled: true, order: 4, label: 'Details',      fields: ['*'] },
    { id: 'ingredients',         type: 'ingredients',         enabled: true, order: 5, label: 'Ingredients' },
    { id: 'how_to_use',          type: 'how_to_use',          enabled: true, order: 6, label: 'How to Use' },
    { id: 'benefits',            type: 'benefits',            enabled: true, order: 7, label: 'Benefits' },
    { id: 'image_strip',         type: 'image_strip',         enabled: true, order: 8 },
    { id: 'related_products',    type: 'related_products',    enabled: true, order: 9 },
  ],
};

// ── Render a single custom field value ─────────────────────
function FieldValue({ field, value }: { field: ITemplateField; value: unknown }) {
  if (value === undefined || value === null || value === '') return null;
  if (field.type === 'boolean') {
    const isTrue = value === true || value === 'true';
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
        isTrue ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100')}>
        {isTrue ? <Check size={10} /> : '✕'} {isTrue ? 'Yes' : 'No'}
      </span>
    );
  }
  if (field.type === 'multiselect' || field.type === 'tags') {
    const items = Array.isArray(value) ? value : String(value).split(',').map(s => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full border border-gray-200">{String(item)}</span>
        ))}
      </div>
    );
  }
  if (field.type === 'textarea') return <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{String(value)}</p>;
  const display = field.unit ? `${value} ${field.unit}` : String(value);
  return <span className="text-sm font-semibold text-gray-800">{display}</span>;
}

// ── Lightbox ─────────────────────────────────────────────
function Lightbox({ images, initial, onClose }: { images: string[]; initial: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initial);
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
        <ArrowLeft size={20} />
      </button>
      <div className="relative w-[90vw] h-[90vh]" onClick={e => e.stopPropagation()}>
        <Image src={images[idx]} alt="" fill className="object-contain" />
      </div>
      <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
        <ArrowRight size={20} />
      </button>
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
          className={cn('w-2 h-2 rounded-full transition-all', i === idx ? 'bg-white w-4' : 'bg-white/40')} />)}
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl">✕</button>
    </div>
  );
}

export default function ProductDetailClient({ product, related }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<{ name: string; value: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedTextFields, setExpandedTextFields] = useState<Set<string>>(new Set());
  const { addItem, openCart } = useCartStore();

  const discount = getDiscountPercent(product.price, product.salePrice);
  const price = product.salePrice || product.price;

  // ── Derive template + layout ───────────────────────────
  const template: IProductTemplate | null = useMemo(() =>
    product.templateId && typeof product.templateId !== 'string' ? product.templateId as IProductTemplate : null,
  [product.templateId]);

  const layout: ITemplateLayout = useMemo(() => {
    // Priority: per-product override > template layout > default
    if (product.productLayout?.sections) return product.productLayout as ITemplateLayout;
    if (template?.layout?.sections?.length) return template.layout;
    return DEFAULT_LAYOUT;
  }, [product.productLayout, template]);

  const sortedSections: ILayoutSection[] = useMemo(() =>
    [...layout.sections].sort((a, b) => a.order - b.order),
  [layout.sections]);

  const templateFields: ITemplateField[] = useMemo(() =>
    template?.fields?.slice().sort((a, b) => a.order - b.order) ?? [],
  [template]);

  const customFields = product.customFields ?? {};

  // ── Ratio to CSS grid cols ─────────────────────────────
  const ratioCols: Record<string, string> = {
    '50-50': 'lg:grid-cols-2',
    '55-45': 'lg:grid-cols-[55%_1fr]',
    '40-60': 'lg:grid-cols-[40%_1fr]',
  };
  const gridCols = ratioCols[layout.imageRatio] ?? 'lg:grid-cols-[55%_1fr]';

  // ── Key spec fields (from layout config) ──────────────
  const keySpecFields = useMemo(() => {
    const keys = layout.keySpecFields?.length ? layout.keySpecFields : [];
    return templateFields.filter(f => keys.includes(f.key) && customFields[f.key] !== undefined && customFields[f.key] !== '');
  }, [layout.keySpecFields, templateFields, customFields]);

  // ── Compute which tabs show up ─────────────────────────
  const tabSections = useMemo(() => {
    const tabTypes = ['description', 'custom_fields_table', 'ingredients', 'how_to_use', 'benefits'] as const;
    return sortedSections.filter(s => {
      if (!s.enabled) return false;
      if (!(tabTypes as readonly string[]).includes(s.type)) return false;
      if (s.type === 'ingredients' && !product.ingredients) return false;
      if (s.type === 'how_to_use' && !product.howToUse) return false;
      if (s.type === 'benefits' && (!product.benefits?.length)) return false;
      if (s.type === 'custom_fields_table') {
        const sectionFields = s.fields ?? ['*'];
        const allowed = sectionFields.includes('*') ? templateFields.map(f => f.key) : sectionFields;
        return allowed.some(key => {
          const v = customFields[key];
          return v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
        });
      }
      return true;
    });
  }, [sortedSections, product, templateFields, customFields]);

  // Set initial active tab on first render
  const firstTab = tabSections[0]?.id ?? null;
  const currentTab = activeTab ?? firstTab;

  // ── Variant groups ─────────────────────────────────────
  const variantGroups = product.variants.reduce<Record<string, string[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v.value);
    return acc;
  }, {});

  const handleAddToCart = () => {
    if (product.variants.length > 0 && !selectedVariant) { toast.error('Please select a variant first'); return; }
    for (let i = 0; i < quantity; i++) addItem(product, 1, selectedVariant ?? undefined);
    openCart();
  };

  // ── Section renderers ──────────────────────────────────
  const renderImageGallery = () => {
    const display = (imageSection?.config?.imageDisplay ?? 'slider') as string;
    const aspectMap: Record<string, string> = { '1:1': 'aspect-square', '4:3': 'aspect-[4/3]', '3:4': 'aspect-[3/4]', '16:9': 'aspect-video' };
    const aspectCls = aspectMap[(imageSection?.config?.imageAspect as string) ?? '4:3'] ?? 'aspect-[4/3]';
    const imgs = product.images;

    if (!imgs.length) return (
      <div className={cn('rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center', aspectCls)}>
        <Package size={60} className="text-gray-300" />
      </div>
    );

    const imgBlock = (src: string, i: number, cls?: string) => (
      <div key={i} className={cn('relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 cursor-zoom-in group', cls)}
        onClick={() => setLightbox(i)}>
        <Image src={src} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 55vw" priority={i===0} />
        {i===0 && discount && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">-{discount}% OFF</span>}
        <div className="absolute bottom-2 right-2 bg-black/30 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><ZoomIn size={14}/></div>
      </div>
    );

    if (display === 'grid-2') return <div className="grid grid-cols-2 gap-2">{imgs.map((img,i) => <div key={i} className={cn('relative', aspectCls)}>{imgBlock(img,i,'absolute inset-0')}</div>)}</div>;
    if (display === 'grid-3') return <div className="grid grid-cols-3 gap-1.5">{imgs.map((img,i) => <div key={i} className={cn('relative', aspectCls)}>{imgBlock(img,i,'absolute inset-0')}</div>)}</div>;
    if (display === 'stack') return <div className="space-y-3">{imgs.map((img,i) => <div key={i} className={cn('relative', aspectCls)}>{imgBlock(img,i,'absolute inset-0')}</div>)}</div>;
    if (display === 'hero-grid') return (
      <div className="space-y-2">
        <div className={cn('relative', aspectCls)}>{imgBlock(imgs[0],0,'absolute inset-0')}</div>
        {imgs.length > 1 && <div className="grid grid-cols-4 gap-1.5">{imgs.slice(1).map((img,i) => <div key={i} className="relative aspect-square"><Image src={img} alt="" fill className="object-cover rounded-xl cursor-zoom-in" sizes="120px" onClick={() => setLightbox(i+1)} /></div>)}</div>}
      </div>
    );
    if (display === 'masonry') return (
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          {imgs.filter((_,i) => i%2===0).map((img,i) => {
            const ri=i*2; const cl=['aspect-[3/4]','aspect-square','aspect-[4/3]'][i%3];
            return <div key={ri} className={cn('relative',cl)}>{imgBlock(img,ri,'absolute inset-0')}</div>;
          })}
        </div>
        <div className="space-y-2">
          {imgs.filter((_,i) => i%2===1).map((img,i) => {
            const ri=i*2+1; const cl=['aspect-square','aspect-[4/3]','aspect-[3/4]'][i%3];
            return <div key={ri} className={cn('relative',cl)}>{imgBlock(img,ri,'absolute inset-0')}</div>;
          })}
        </div>
      </div>
    );

    // slider (default)
    return (
      <div className="space-y-3">
        <div className={cn('relative', aspectCls)}>{imgBlock(imgs[selectedImage]??imgs[0], selectedImage, 'absolute inset-0')}</div>
        {imgs.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {imgs.map((img,i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={cn('relative aspect-square rounded-xl overflow-hidden border-2 transition-all', selectedImage===i?'border-gray-800':'border-transparent hover:border-gray-300')}>
                <Image src={img} alt="" fill className="object-cover" sizes="100px" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Key specs bar (shown inside image column)
  const renderKeySpecs = () => keySpecFields.length > 0 && (
    <div className="grid grid-cols-2 gap-2">
      {keySpecFields.map(field => (
        <div key={field.key} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <span className="text-xs text-gray-500 font-medium">{field.label}</span>
          <FieldValue field={field} value={customFields[field.key]} />
        </div>
      ))}
    </div>
  );


  const renderProductHeader = () => (
    <div className="space-y-5">
      {typeof product.category === 'object' && (
        <Link href={`/category/${product.category.slug}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-700 transition">
          <Leaf size={11} />{product.category.name}
        </Link>
      )}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-gray-900">{product.name}</h1>
        {template && <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full mt-2">{template.emoji} {template.name}</span>}
      </div>
      {product.reviewCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}</div>
          <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
          <a href="#reviews" className="text-sm text-gray-400 hover:text-gray-600">{product.reviewCount} review{product.reviewCount > 1 ? 's' : ''}</a>
        </div>
      )}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
        {product.salePrice && product.salePrice < product.price && <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>}
        {discount && <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Save {discount}%</span>}
      </div>
      {product.shortDescription && <p className="text-gray-600 text-sm leading-relaxed">{product.shortDescription}</p>}
      {/* Variants */}
      {Object.entries(variantGroups).map(([groupName, values]) => (
        <div key={groupName}>
          <p className="text-sm font-semibold text-gray-700 mb-2">{groupName}:</p>
          <div className="flex flex-wrap gap-2">
            {values.map(value => (
              <button key={value} onClick={() => setSelectedVariant({ name: groupName, value })}
                className={cn('px-4 py-2 rounded-xl text-sm border-2 font-medium transition-all',
                  selectedVariant?.name === groupName && selectedVariant?.value === value
                    ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400')}>
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
      {/* Stock */}
      <div className="flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full', product.stock > 0 ? 'bg-green-500' : 'bg-red-400')} />
        <span className={cn('text-sm font-medium', product.stock > 0 ? 'text-green-700' : 'text-red-500')}>
          {product.stock <= 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : 'In stock'}
        </span>
      </div>
      {/* Qty + Cart */}
      <div className="flex gap-3">
        <div className="flex items-center border border-gray-200 rounded-xl">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition" aria-label="Decrease"><Minus size={15} /></button>
          <span className="w-10 text-center text-sm font-bold text-gray-800">{quantity}</span>
          <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition" aria-label="Increase"><Plus size={15} /></button>
        </div>
        <button onClick={handleAddToCart} disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold rounded-xl py-2.5 hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          <ShoppingBag size={16} />{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button className="w-11 h-11 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-500 hover:text-red-500" aria-label="Wishlist"><Heart size={18} /></button>
      </div>
      {/* Trust strip */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100">
        {[{ icon: <Truck size={14} />, label: 'Free delivery', sub: 'Above ₹499' },
          { icon: <Shield size={14} />, label: '100% Authentic', sub: 'Verified quality' },
          { icon: <RotateCcw size={14} />, label: '7-day returns', sub: 'Hassle-free' },
        ].map(b => (
          <div key={b.label} className="text-center py-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex justify-center text-gray-400 mb-1">{b.icon}</div>
            <p className="text-xs font-semibold text-gray-700">{b.label}</p>
            <p className="text-[10px] text-gray-400">{b.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = (section: ILayoutSection) => {
    if (section.type === 'description') {
      return <div className="prose prose-gray max-w-none text-gray-700 leading-loose text-sm"
        dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />;
    }
    if (section.type === 'custom_fields_table') {
      const sectionFields = section.fields ?? ['*'];
      const allowed = sectionFields.includes('*') ? templateFields.map(f => f.key) : sectionFields;
      const visibleFields = templateFields.filter(f => {
        if (!allowed.includes(f.key)) return false;
        const v = customFields[f.key];
        return v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
      });
      return (
        <div className="space-y-0 divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {visibleFields.map(field => {
            const value = customFields[field.key];
            const isLong = field.type === 'textarea';
            const isExpanded = expandedTextFields.has(field.key);
            return (
              <div key={field.key} className="flex gap-4 px-5 py-4 bg-white hover:bg-gray-50 transition-colors">
                <div className="w-40 shrink-0">
                  <p className="text-sm font-semibold text-gray-700">{field.label}</p>
                  {field.unit && <p className="text-xs text-gray-400 mt-0.5">{field.unit}</p>}
                </div>
                <div className="flex-1">
                  {isLong ? (
                    <div>
                      <p className={cn('text-sm text-gray-700 leading-relaxed whitespace-pre-line', !isExpanded && 'line-clamp-3')}>{String(value)}</p>
                      {String(value).split('\n').length > 3 && (
                        <button onClick={() => setExpandedTextFields(p => { const n = new Set(p); n.has(field.key) ? n.delete(field.key) : n.add(field.key); return n; })}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1.5 transition">
                          {isExpanded ? 'Show less' : 'Show more'}<ChevronDown size={12} className={cn('transition-transform', isExpanded && 'rotate-180')} />
                        </button>
                      )}
                    </div>
                  ) : <FieldValue field={field} value={value} />}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    if (section.type === 'ingredients' && product.ingredients) {
      return <div className="text-gray-700 leading-loose text-sm whitespace-pre-line">{product.ingredients}</div>;
    }
    if (section.type === 'how_to_use' && product.howToUse) {
      return (
        <ol className="space-y-3">
          {product.howToUse.split('\n').filter(Boolean).map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-sm text-gray-700 leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      );
    }
    if (section.type === 'benefits' && product.benefits?.length) {
      return (
        <div className="grid sm:grid-cols-2 gap-3">
          {product.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{b}</p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const imageSection = sortedSections.find(s => s.type === 'image_gallery' && s.enabled);
  const headerSection = sortedSections.find(s => s.type === 'product_header' && s.enabled);
  const showImageStrip = sortedSections.find(s => s.type === 'image_strip' && s.enabled) && product.images.length >= 4;
  const showRelated = sortedSections.find(s => s.type === 'related_products' && s.enabled) && related.length > 0;

  const imageOrder = layout.imagePosition === 'right' ? 'lg:order-2' : '';
  const infoOrder  = layout.imagePosition === 'right' ? 'lg:order-1' : '';

  return (
    <div className="bg-white min-h-screen">
      {lightbox !== null && <Lightbox images={product.images} initial={lightbox} onClose={() => setLightbox(null)} />}

      {/* ── Section 1: Image + Info side by side ────── */}
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-gray-800 transition">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-gray-800 transition">Products</Link>
          {typeof product.category === 'object' && (
            <><ChevronRight size={12} /><Link href={`/category/${product.category.slug}`} className="hover:text-gray-800 transition">{product.category.name}</Link></>
          )}
          <ChevronRight size={12} />
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className={cn('grid gap-10 xl:gap-16', gridCols)}>
          {imageSection && <div className={imageOrder}><div className="space-y-3">{renderImageGallery()}{renderKeySpecs()}</div></div>}
          {headerSection && <div className={cn('lg:sticky lg:top-6 lg:self-start', infoOrder)}>{renderProductHeader()}</div>}
        </div>
      </div>

      {/* ── Section 2: Content tabs ──────────────────── */}
      {tabSections.length > 0 && (
        <div className="container pb-16">
          <div className="border-b border-gray-200 flex gap-0 overflow-x-auto mb-8">
            {tabSections.map(section => (
              <button key={section.id} onClick={() => setActiveTab(section.id)}
                className={cn('px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all',
                  currentTab === section.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700')}>
                {section.label ?? section.type}
              </button>
            ))}
          </div>
          <div className="max-w-3xl">
            {tabSections.map(section => (
              currentTab === section.id && (
                <div key={section.id}>{renderTabContent(section)}</div>
              )
            ))}
          </div>
        </div>
      )}

      {/* ── Section 3: Image strip ────────────────────── */}
      {showImageStrip && (
        <div className="bg-gray-50 border-y border-gray-100 py-10">
          <div className="container">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">More views</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {product.images.slice(0, 8).map((img, i) => (
                <button key={i} onClick={() => setLightbox(i)}
                  className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-200 hover:border-gray-400 transition">
                  <Image src={img} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="300px" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                    <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Section 4: Related products ──────────────── */}
      {showRelated && (
        <div className="container py-14">
          <h2 className="font-heading text-2xl font-bold mb-8 text-gray-900">You May Also Like</h2>
          <div className="grid-products">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
