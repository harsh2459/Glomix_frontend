'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag, Heart, Minus, Plus, Check, Package,
  ChevronDown, ZoomIn, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { IProduct, IProductTemplate, ITemplateField, ILayoutSection, ITemplateLayout, IReview } from '../../../../types';
import { formatPrice, getDiscountPercent } from '../../../../lib/utils';
import { useCartStore } from '../../../../stores/cartStore';
import { useAuthStore } from '../../../../stores/authStore';
import { apiPost } from '../../../../lib/api';
import api from '../../../../lib/api';
import ProductCard from '../../../../components/products/ProductCard';
import toast from 'react-hot-toast';

interface Props { product: IProduct; related: IProduct[]; }

const DEFAULT_LAYOUT: ITemplateLayout = {
  imagePosition: 'left',
  imageRatio: '50-50',
  keySpecFields: [],
  sections: [
    { id: 'image_gallery',       type: 'image_gallery',       enabled: true, order: 0 },
    { id: 'product_header',      type: 'product_header',      enabled: true, order: 1 },
    { id: 'description',         type: 'description',         enabled: true, order: 3, label: 'Description' },
    { id: 'custom_fields_table', type: 'custom_fields_table', enabled: true, order: 4, label: 'Details', fields: ['*'] },
    { id: 'ingredients',         type: 'ingredients',         enabled: true, order: 5, label: 'Ingredients' },
    { id: 'how_to_use',          type: 'how_to_use',          enabled: true, order: 6, label: 'How to Use' },
    { id: 'benefits',            type: 'benefits',            enabled: true, order: 7, label: 'Benefits' },
    { id: 'related_products',    type: 'related_products',    enabled: true, order: 9 },
  ],
};

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? 'var(--accent)' : 'var(--bg-muted)', fontSize: size }}>★</span>
      ))}
    </div>
  );
}

function FieldValue({ field, value }: { field: ITemplateField; value: unknown }) {
  if (value === undefined || value === null || value === '') return null;
  if (field.type === 'boolean') {
    const isTrue = value === true || value === 'true';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
        padding: '3px 10px', borderRadius: 'var(--radius-pill)',
        background: isTrue ? 'var(--success-bg)' : 'var(--error-bg)',
        color: isTrue ? 'var(--success)' : 'var(--error)',
        border: `1px solid ${isTrue ? 'var(--success-border)' : 'var(--error-border)'}`,
      }}>
        {isTrue ? <Check size={10} /> : '✕'} {isTrue ? 'Yes' : 'No'}
      </span>
    );
  }
  if (field.type === 'multiselect' || field.type === 'tags') {
    const items = Array.isArray(value) ? value : String(value).split(',').map(s => s.trim()).filter(Boolean);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-alt)', color: 'var(--text-sub)' }}>
            {String(item)}
          </span>
        ))}
      </div>
    );
  }
  if (field.type === 'textarea') return <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-sub)', fontWeight: 300, whiteSpace: 'pre-line' }}>{String(value)}</p>;
  const display = field.unit ? `${value} ${field.unit}` : String(value);
  return <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{display}</span>;
}

function Lightbox({ images, initial, onClose }: { images: string[]; initial: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initial);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={20} />
      </button>
      <div style={{ position: 'relative', width: '88vw', height: '88vh' }} onClick={e => e.stopPropagation()}>
        <Image src={images[idx]} alt="" fill style={{ objectFit: 'contain' }} />
      </div>
      <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer' }}>
        <ArrowRight size={20} />
      </button>
      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
        {images.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
            style={{ borderRadius: 99, border: 'none', cursor: 'pointer', background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)', width: i === idx ? 24 : 8, height: 8, padding: 0, transition: 'all 0.2s' }} />
        ))}
      </div>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
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
  const [wishlisted, setWishlisted] = useState(false);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const { addItem, openCart } = useCartStore();
  const { user } = useAuthStore();

  const discount = getDiscountPercent(product.price, product.salePrice);
  const price = product.salePrice || product.price;

  useEffect(() => {
    api.get<{ data: IReview[] }>(`/reviews/product/${product._id}`)
      .then(res => setReviews((res.data.data ?? []).filter(r => r.isApproved)))
      .catch(() => {});
  }, [product._id]);

  const template: IProductTemplate | null = useMemo(() =>
    product.templateId && typeof product.templateId !== 'string' ? product.templateId as IProductTemplate : null,
  [product.templateId]);

  const layout: ITemplateLayout = useMemo(() => {
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
        return allowed.some(key => { const v = customFields[key]; return v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0); });
      }
      return true;
    });
  }, [sortedSections, product, templateFields, customFields]);

  const firstTab = tabSections[0]?.id ?? null;
  const currentTab = activeTab ?? firstTab;

  const variantGroups = product.variants.reduce<Record<string, string[]>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v.value);
    return acc;
  }, {});

  const showRelated = sortedSections.find(s => s.type === 'related_products' && s.enabled) && related.length > 0;

  const ratingDist = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
    return dist;
  }, [reviews]);

  const handleAddToCart = () => {
    if (product.variants.length > 0 && !selectedVariant) { toast.error('Please select a variant first'); return; }
    for (let i = 0; i < quantity; i++) addItem(product, 1, selectedVariant ?? undefined);
    openCart();
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Login to save to wishlist'); return; }
    try {
      await apiPost(`/auth/wishlist/${product._id}`, {});
      setWishlisted(w => !w);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Could not update wishlist'); }
  };

  const renderGallery = () => {
    const imgs = product.images;
    if (!imgs.length) return (
      <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-xl)', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={60} style={{ opacity: 0.2 }} />
      </div>
    );
    return (
      <div>
        <div
          style={{ width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--bg-alt)', marginBottom: 12, position: 'relative', cursor: 'zoom-in' }}
          onClick={() => setLightbox(selectedImage)}
        >
          <Image
            src={imgs[selectedImage] ?? imgs[0]}
            alt={product.name}
            fill
            style={{ objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
          {discount && (
            <span style={{ position: 'absolute', top: 16, left: 16, background: 'var(--ink)', color: 'var(--ink-text)', fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 'var(--radius)', letterSpacing: '0.04em' }}>
              -{discount}%
            </span>
          )}
          <div style={{ position: 'absolute', bottom: 12, right: 12, width: 34, height: 34, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <ZoomIn size={14} style={{ color: '#fff' }} />
          </div>
        </div>
        {imgs.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {imgs.slice(0, 8).map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                style={{
                  aspectRatio: '1/1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-alt)',
                  border: `2px solid ${selectedImage === i ? 'var(--accent)' : 'transparent'}`,
                  cursor: 'pointer', padding: 0, position: 'relative', transition: 'border-color 0.2s',
                }}>
                <Image src={img} alt="" fill style={{ objectFit: 'cover' }} sizes="100px" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = (section: ILayoutSection) => {
    const listItem = (text: string, i: number) => (
      <li key={i} style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 300, padding: '10px 0', display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.65 }}>
        <span style={{ color: 'var(--accent)', fontSize: 17, lineHeight: 1, flexShrink: 0, marginTop: 3 }}>·</span>
        {text}
      </li>
    );

    if (section.type === 'description') {
      return (
        <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.85, fontWeight: 300 }}
          dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
      );
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
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {visibleFields.map(field => {
            const value = customFields[field.key];
            const isLong = field.type === 'textarea';
            const isExpanded = expandedTextFields.has(field.key);
            return (
              <li key={field.key} style={{ display: 'flex', gap: 16, padding: '10px 0', alignItems: 'flex-start' }}>
                <span style={{ width: 140, flexShrink: 0, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{field.label}</span>
                <div style={{ flex: 1 }}>
                  {isLong ? (
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7, fontWeight: 300, whiteSpace: 'pre-line', overflow: isExpanded ? 'visible' : 'hidden', display: '-webkit-box', WebkitLineClamp: isExpanded ? 'none' : 3, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                        {String(value)}
                      </p>
                      {String(value).split('\n').length > 3 && (
                        <button onClick={() => setExpandedTextFields(p => { const n = new Set(p); n.has(field.key) ? n.delete(field.key) : n.add(field.key); return n; })}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text)', marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                          {isExpanded ? 'Show less' : 'Show more'}<ChevronDown size={11} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                      )}
                    </div>
                  ) : <FieldValue field={field} value={value} />}
                </div>
              </li>
            );
          })}
        </ul>
      );
    }
    if (section.type === 'ingredients' && product.ingredients) {
      return <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{product.ingredients.split('\n').filter(Boolean).map(listItem)}</ul>;
    }
    if (section.type === 'how_to_use' && product.howToUse) {
      return <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{product.howToUse.split('\n').filter(Boolean).map(listItem)}</ul>;
    }
    if (section.type === 'benefits' && product.benefits?.length) {
      return <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{product.benefits.map(listItem)}</ul>;
    }
    return null;
  };

  const reviewCount = reviews.length || product.reviewCount;
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {lightbox !== null && <Lightbox images={product.images} initial={lightbox} onClose={() => setLightbox(null)} />}

      {/* Breadcrumb */}
      <div style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-faint)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'var(--border-strong)' }}>›</span>
          <Link href="/products" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Products</Link>
          {typeof product.category === 'object' && (
            <>
              <span style={{ color: 'var(--border-strong)' }}>›</span>
              <Link href={`/category/${product.category.slug}`} style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>
                {product.category.name}
              </Link>
            </>
          )}
          <span style={{ color: 'var(--border-strong)' }}>›</span>
          <span style={{ color: 'var(--text-sub)', fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      {/* Product layout */}
      <div className="container" style={{ paddingTop: 52, paddingBottom: 80 }}>
        <div className="pdp-layout">

          {/* Gallery */}
          <div className="pdp-gallery-sticky" style={{ position: 'sticky', top: 88 }}>
            {renderGallery()}
          </div>

          {/* Info panel */}
          <div>

            {/* Category tag */}
            {typeof product.category === 'object' && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-dark)', fontWeight: 500, marginBottom: 14 }}>
                <span style={{ width: 16, height: 1, background: 'var(--accent)', display: 'inline-block', flexShrink: 0 }} />
                {product.category.name}
              </div>
            )}

            {/* Title */}
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, lineHeight: 1.1, color: 'var(--text)', marginBottom: 18, letterSpacing: '-0.01em' }}>
              {product.name}
            </h1>

            {/* Rating row */}
            {product.reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                <Stars rating={avgRating} size={15} />
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{avgRating.toFixed(1)}</span>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                <span style={{ color: 'var(--border-strong)' }}>·</span>
                <a href="#reviews" style={{ fontSize: 13, color: 'var(--accent-dark)', textDecoration: 'none', borderBottom: '1px solid rgba(200,169,110,0.4)', paddingBottom: 1 }}>
                  Read reviews
                </a>
              </div>
            )}

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 48, fontWeight: 600, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {formatPrice(price)}
              </span>
              {product.salePrice && product.salePrice < product.price && (
                <span style={{ fontSize: 22, color: 'var(--text-faint)', textDecoration: 'line-through', fontWeight: 300 }}>
                  {formatPrice(product.price)}
                </span>
              )}
              {discount && (
                <span style={{ background: 'var(--success-bg)', color: 'var(--success)', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 'var(--radius-pill)' }}>
                  Save {discount}%
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 22 }}>
              Inclusive of all taxes &nbsp;·&nbsp; Free delivery on orders above ₹499
            </p>

            {/* Short description */}
            {product.shortDescription && (
              <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.85, marginBottom: 20, fontWeight: 300 }}>
                {product.shortDescription}
              </p>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{ padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-alt)', fontSize: 11, color: 'var(--text-sub)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Variants */}
            {Object.entries(variantGroups).map(([groupName, values]) => (
              <div key={groupName} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 10 }}>{groupName}:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {values.map(value => {
                    const active = selectedVariant?.name === groupName && selectedVariant?.value === value;
                    return (
                      <button key={value} onClick={() => setSelectedVariant({ name: groupName, value })}
                        style={{
                          padding: '8px 18px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: active ? 500 : 400,
                          border: `1.5px solid ${active ? 'var(--ink)' : 'var(--border)'}`,
                          background: active ? 'var(--ink)' : 'transparent',
                          color: active ? 'var(--ink-text)' : 'var(--text-sub)',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        }}>
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Stock status */}
            <div style={{ marginBottom: 24 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 500,
                color: product.stock > 0 ? 'var(--success)' : 'var(--error)', letterSpacing: '0.04em',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: product.stock > 0 ? 'var(--success)' : 'var(--error)', flexShrink: 0, display: 'inline-block' }} />
                {product.stock <= 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left — Order soon` : 'In Stock — Ready to Ship'}
              </span>
            </div>

            {/* Qty + Add to Cart + Wishlist */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-alt)', borderRadius: 'var(--radius)', overflow: 'hidden', flexShrink: 0 }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: 44, height: 52, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  aria-label="Decrease">
                  <Minus size={14} />
                </button>
                <span style={{ width: 44, textAlign: 'center', fontSize: 15, fontWeight: 500, color: 'var(--text)', lineHeight: '52px', userSelect: 'none' }}>
                  {quantity}
                </span>
                <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  style={{ width: 44, height: 52, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  aria-label="Increase">
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  flex: 1, height: 52,
                  background: product.stock === 0 ? 'var(--text-faint)' : 'var(--ink)',
                  color: 'var(--ink-text)',
                  border: 'none', borderRadius: 'var(--radius)', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.background = 'var(--ink-hover)'; }}
                onMouseLeave={e => { if (product.stock > 0) e.currentTarget.style.background = 'var(--ink)'; }}
              >
                <ShoppingBag size={15} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={handleWishlist}
                aria-label="Wishlist"
                style={{
                  width: 52, height: 52, borderRadius: 'var(--radius)',
                  background: wishlisted ? 'var(--error-bg)' : 'var(--bg-alt)',
                  color: wishlisted ? 'var(--error)' : 'var(--text-faint)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Buy Now */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                width: '100%', height: 50, background: 'none',
                border: '1.5px solid var(--ink)', borderRadius: 'var(--radius)',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', color: 'var(--ink)', transition: 'all 0.2s', marginBottom: 24, marginTop: 10,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--ink)'; }}
            >
              Buy Now
            </button>

            {/* Perks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28, padding: 18, background: 'var(--bg-alt)', borderRadius: 'var(--radius-xl)' }}>
              {[
                { icon: '🚚', label: 'Free Delivery', sub: 'Orders above ₹499' },
                { icon: '✓', label: '100% Authentic', sub: 'Verified quality' },
                { icon: '↩', label: '7-Day Returns', sub: 'Hassle-free' },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 7 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {p.icon}
                  </div>
                  <div>
                    <strong style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', display: 'block', marginBottom: 2 }}>{p.label}</strong>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{p.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            {tabSections.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', overflowX: 'auto', gap: 0, background: 'var(--bg-alt)', borderRadius: 'var(--radius-lg)', padding: 4 }}>
                  {tabSections.map(section => {
                    const active = currentTab === section.id;
                    return (
                      <button key={section.id} onClick={() => setActiveTab(section.id)}
                        style={{
                          padding: '10px 18px',
                          background: active ? 'var(--surface)' : 'transparent',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 500 : 400,
                          color: active ? 'var(--text)' : 'var(--text-faint)',
                          cursor: 'pointer', whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                          boxShadow: active ? 'var(--shadow-card)' : 'none',
                        }}>
                        {section.label ?? section.type}
                      </button>
                    );
                  })}
                </div>
                <div style={{ paddingTop: 20 }}>
                  {tabSections.map(section => currentTab === section.id && (
                    <div key={section.id}>{renderTabContent(section)}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      {reviewCount > 0 && (
        <div className="container" style={{ paddingBottom: 72 }} id="reviews">
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 34, fontWeight: 400, color: 'var(--text)' }}>
              Customer <em style={{ fontStyle: 'italic', color: 'var(--accent-dark)' }}>Reviews</em>
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 6 }}>{reviewCount} verified purchase{reviewCount !== 1 ? 's' : ''}</p>
          </div>

          {/* Summary card */}
          <div className="pdp-rating-summary" style={{ marginBottom: 36, padding: 28, background: 'var(--bg-alt)', borderRadius: 'var(--radius-xl)', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 72, fontWeight: 300, lineHeight: 1, color: 'var(--text)', marginBottom: 10 }}>
                {avgRating.toFixed(1)}
              </span>
              <Stars rating={avgRating} size={18} />
              <span style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8 }}>Based on {reviewCount} reviews</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[5,4,3,2,1].map(star => {
                const count = reviews.length ? ratingDist[star] : 0;
                const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-sub)', width: 28, textAlign: 'right', flexShrink: 0 }}>{star}★</span>
                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 3, width: `${pct}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)', width: 28, flexShrink: 0 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review cards */}
          {reviews.length > 0 && (
            <div className="pdp-reviews-grid">
              {reviews.map(review => (
                <div key={review._id} style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{review.userName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <Stars rating={review.rating} size={12} />
                  </div>
                  {review.isVerifiedPurchase && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--success)', fontWeight: 500, letterSpacing: '0.05em', marginBottom: 10 }}>
                      ✓ Verified Purchase
                    </span>
                  )}
                  {review.title && (
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{review.title}</p>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7, fontWeight: 300 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related products */}
      {showRelated && (
        <div className="container" style={{ paddingBottom: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 34, fontWeight: 400, color: 'var(--text)' }}>
                You May Also <em style={{ fontStyle: 'italic', color: 'var(--accent-dark)' }}>Like</em>
              </h2>
              {typeof product.category === 'object' && (
                <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4 }}>More from our {product.category.name} collection</p>
              )}
            </div>
            {typeof product.category === 'object' && (
              <Link href={`/category/${product.category.slug}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13, color: 'var(--text-sub)', fontWeight: 500 }}>
                View all →
              </Link>
            )}
          </div>
          <div className="grid-products">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
