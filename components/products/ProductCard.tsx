'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { IProduct } from '../../types';
import { formatPrice, getDiscountPercent, cn } from '../../lib/utils';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { apiPost } from '../../lib/api';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: IProduct;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, openCart }   = useCartStore();
  const { user }                = useAuthStore();
  const [imgError, setImgError] = useState(false);
  const [wishlisted, setWishlisted]     = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const discount     = getDiscountPercent(product.price, product.salePrice);
  const price        = product.salePrice || product.price;
  const hasImage     = product.images?.[0] && !imgError;
  const isOutOfStock = product.stock === 0;
  const isNew        = product.isFeatured && !discount;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants?.length > 0) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    setAddingToCart(true);
    addItem(product);
    openCart();
    setTimeout(() => setAddingToCart(false), 900);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Login to save to wishlist'); return; }
    try {
      await apiPost(`/auth/wishlist/${product._id}`, {});
      setWishlisted(w => !w);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn('group block', className)}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(10,10,10,0.09)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.07)';
      }}
    >
      {/* Image area */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', background: '#f5f3ef' }}>
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: '#f5f3ef' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>🌸</div>
            <span style={{ fontSize: 11, color: '#b0a99e', textAlign: 'center', padding: '0 16px' }} className="line-clamp-2">{product.name}</span>
          </div>
        )}

        {/* Badge */}
        {isOutOfStock ? (
          <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(10,10,10,0.65)', color: '#fafaf8', padding: '4px 9px', borderRadius: 9999 }}>
            Sold Out
          </span>
        ) : discount ? (
          <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em', background: '#0a0a0a', color: '#fafaf8', padding: '4px 9px', borderRadius: 9999 }}>
            −{discount}%
          </span>
        ) : isNew ? (
          <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#c8a96e', color: '#fff', padding: '4px 9px', borderRadius: 9999 }}>
            New
          </span>
        ) : null}

        {/* Wishlist btn */}
        <button
          aria-label="Wishlist"
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
        >
          <Heart size={13} fill={wishlisted ? '#c1392b' : 'none'} stroke={wishlisted ? '#c1392b' : '#3d3a35'} />
        </button>

        {/* Quick add */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            style={{
              padding: '11px',
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              background: addingToCart ? '#2d4a3e' : '#0a0a0a',
              color: '#fafaf8',
              backdropFilter: 'blur(6px)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            {addingToCart ? '✓ Added!' : product.variants?.length > 0 ? '+ Choose Options' : '+ Add to Cart'}
          </button>
        )}

        {isOutOfStock && (
          <div
            className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-center"
            style={{ padding: 11, fontSize: 11, fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', background: '#f5f3ef', color: '#b0a99e' }}
          >
            Out of Stock
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Category */}
        {typeof product.category === 'object' && product.category?.name && (
          <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#b0a99e', marginBottom: 5, fontWeight: 500 }}>
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 style={{ fontSize: 13.5, fontWeight: 400, color: '#0a0a0a', lineHeight: 1.4, marginBottom: 8 }} className="line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={10} fill={s <= Math.round(product.rating) ? '#c8a96e' : '#e8e4dd'} stroke="none" />
              ))}
            </div>
            <span style={{ fontSize: 11, color: '#b0a99e' }}>({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 17, fontWeight: 500, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
            {formatPrice(price)}
          </span>
          {product.salePrice && product.salePrice < product.price && (
            <span style={{ fontSize: 12.5, color: '#c4bdb5', textDecoration: 'line-through' }}>
              {formatPrice(product.price)}
            </span>
          )}
          {discount && (
            <span className="ml-auto" style={{ fontSize: 11, color: '#2d7a4f', fontWeight: 500 }}>
              −{discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
