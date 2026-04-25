'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { IProduct } from '../../../../types';
import { apiGet, apiPost } from '../../../../lib/api';
import { formatPrice } from '../../../../lib/utils';
import { useCartStore } from '../../../../stores/cartStore';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCartStore();

  const loadWishlist = () => {
    apiGet<{ user: { wishlist: (IProduct | string)[] } }>('/auth/me')
      .then(res => {
        const wishlist = res.user?.wishlist ?? [];
        setProducts(wishlist.filter((w): w is IProduct => typeof w === 'object' && '_id' in w));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWishlist(); }, []);

  const removeFromWishlist = async (productId: string) => {
    try {
      await apiPost(`/auth/wishlist/${productId}`, {});
      setProducts(p => p.filter(prod => prod._id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleAddToCart = (product: IProduct) => {
    addItem(product, 1);
    openCart();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>Wishlist</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Your saved products ({products.length})</p>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ borderRadius: 'var(--radius-xl)', aspectRatio: '3/4' }} />)}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', textAlign: 'center', padding: '5rem 1.5rem' }}>
          <Heart size={48} style={{ color: 'var(--bg-muted)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Your wishlist is empty</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '1.5rem' }}>Save products you love and shop them later</p>
          <Link href="/products" className="btn-primary" style={{ fontSize: 13, padding: '0.6rem 1.5rem' }}>Browse Products</Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {products.map(product => (
            <div key={product._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
              <Link href={`/products/${product.slug}`} style={{ display: 'block', position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--bg-alt)' }}>
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 100vw, 33vw" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={40} style={{ color: 'var(--bg-muted)' }} />
                  </div>
                )}
                {product.salePrice && product.salePrice < product.price && (
                  <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--error)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-pill)', letterSpacing: '0.05em' }}>SALE</span>
                )}
              </Link>
              <div style={{ padding: '1rem' }}>
                <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontWeight: 500, color: 'var(--text)', fontSize: 13, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                    {product.name}
                  </h3>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{formatPrice(product.salePrice || product.price)}</span>
                  {product.salePrice && product.salePrice < product.price && (
                    <span style={{ fontSize: 12, color: 'var(--text-faint)', textDecoration: 'line-through' }}>{formatPrice(product.price)}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => handleAddToCart(product)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--ink)', color: 'var(--ink-text)', fontSize: 12, fontWeight: 600, padding: '9px 0', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink-hover)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--ink)'}>
                    <ShoppingBag size={13} /> Add to Cart
                  </button>
                  <button onClick={() => removeFromWishlist(product._id)}
                    style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', color: 'var(--text-faint)', background: 'none', transition: 'all 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--error-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--error-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--error)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'; }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
