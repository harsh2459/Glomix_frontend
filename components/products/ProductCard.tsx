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
  const { addItem, openCart } = useCartStore();
  const { user } = useAuthStore();
  const [imgError, setImgError] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const discount = getDiscountPercent(product.price, product.salePrice);
  const price = product.salePrice || product.price;
  const hasImage = product.images?.[0] && !imgError;
  const isOutOfStock = product.stock === 0;
  const isNew = product.isFeatured && !discount;

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
    setTimeout(() => setAddingToCart(false), 800);
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
        background: '#fafaf8',
        border: '1px solid #e8e4dd',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.3s ease, border-color 0.3s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(10,10,10,0.09)';
        (e.currentTarget as HTMLElement).style.borderColor = '#b0a99e';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.borderColor = '#e8e4dd';
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1', background: '#f4f1ec' }}>
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: '#f4f1ec' }}>
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm">🌸</div>
            <span className="text-xs px-4 text-center line-clamp-2" style={{ color: '#b0a99e' }}>{product.name}</span>
          </div>
        )}

        {/* Badge */}
        {discount && (
          <span className="absolute top-3 left-3 text-[10px] font-medium px-2 py-1 rounded"
            style={{ background: '#0a0a0a', color: '#fafaf8', letterSpacing: '0.04em' }}>
            −{discount}%
          </span>
        )}
        {isNew && !discount && (
          <span className="absolute top-3 left-3 text-[10px] font-medium px-2 py-1 rounded uppercase"
            style={{ background: '#c8a96e', color: '#fff', letterSpacing: '0.06em' }}>
            New
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-3 left-3 text-[10px] font-medium px-2 py-1 rounded"
            style={{ background: 'rgba(10,10,10,0.7)', color: '#fafaf8', letterSpacing: '0.04em' }}>
            Sold Out
          </span>
        )}

        {/* Wishlist btn — appears on hover */}
        <button
          aria-label="Wishlist"
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0"
          style={{ background: 'rgba(250,250,248,0.92)', border: 'none', cursor: 'pointer' }}
        >
          <Heart size={14} fill={wishlisted ? '#c1392b' : 'none'} stroke={wishlisted ? '#c1392b' : '#4a453f'} />
        </button>

        {/* Quick add — slides up on hover */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 right-0 py-3 text-xs font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            style={{
              background: addingToCart ? 'rgba(45,74,62,0.92)' : 'rgba(10,10,10,0.88)',
              color: '#fafaf8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              backdropFilter: 'blur(4px)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {addingToCart ? '✓ Added!' : product.variants?.length > 0 ? '+ Choose Options' : '+ Add to Cart'}
          </button>
        )}

        {isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 py-3 text-xs font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-center uppercase"
            style={{ background: '#e8e4dd', color: '#b0a99e', letterSpacing: '0.08em' }}>
            Out of Stock
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Category */}
        {typeof product.category === 'object' && product.category?.name && (
          <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b0a99e', marginBottom: 5, fontWeight: 500 }}>
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 style={{ fontSize: 14, fontWeight: 400, color: '#0a0a0a', lineHeight: 1.4, marginBottom: 9 }}
          className="line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5" style={{ marginBottom: 11 }}>
            <div className="flex gap-px">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11}
                  fill={s <= Math.round(product.rating) ? '#c8a96e' : '#e8e4dd'}
                  stroke="none"
                />
              ))}
            </div>
            <span style={{ fontSize: 11, color: '#b0a99e' }}>({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 18, fontWeight: 500, color: '#0a0a0a', letterSpacing: '-0.01em' }}>
            {formatPrice(price)}
          </span>
          {product.salePrice && product.salePrice < product.price && (
            <span style={{ fontSize: 13, color: '#b0a99e', textDecoration: 'line-through' }}>
              {formatPrice(product.price)}
            </span>
          )}
          {discount && (
            <span className="ml-auto" style={{ fontSize: 11, color: '#2d4a3e', fontWeight: 500 }}>
              Save {discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
