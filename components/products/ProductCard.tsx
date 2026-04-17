'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Zap } from 'lucide-react';
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

  const hasImage = product.images?.[0] && !imgError;
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group block bg-white rounded-3xl overflow-hidden transition-all duration-300',
        'border border-gray-100 hover:border-gray-200',
        'hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)]',
        className
      )}
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-rose-50/60 via-pink-50/30 to-purple-50/40">
        {hasImage ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
            {/* subtle vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white/80 shadow-md flex items-center justify-center text-4xl">
              🌸
            </div>
            <span className="text-xs text-gray-400 font-medium px-6 text-center line-clamp-2">{product.name}</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
              -{discount}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
          {product.isFeatured && !discount && !isOutOfStock && (
            <span className="bg-amber-400 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
              ✦ Featured
            </span>
          )}
        </div>

        {/* Action buttons — top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            aria-label="Add to wishlist"
            onClick={handleWishlist}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
              'bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm',
              'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0',
              wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            )}
          >
            <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/products/${product.slug}`;
            }}
            aria-label="Quick view"
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
              'bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm text-gray-400 hover:text-gray-700',
              'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 delay-75'
            )}
          >
            <Eye size={15} />
          </button>
        </div>

        {/* Add to cart — slide up on hover */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <button
              onClick={handleAddToCart}
              className={cn(
                'w-full py-3.5 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all',
                addingToCart
                  ? 'bg-green-600'
                  : 'bg-gray-900 hover:bg-gray-800'
              )}
            >
              {addingToCart ? (
                <>
                  <Zap size={14} className="fill-white" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  {product.variants?.length > 0 ? 'Choose Options' : 'Add to Cart'}
                </>
              )}
            </button>
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <div className="w-full py-3.5 bg-gray-200 text-gray-500 text-xs font-semibold flex items-center justify-center">
              Out of Stock
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 pb-5">
        {/* Category */}
        {typeof product.category === 'object' && product.category?.name && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-gray-600 transition-colors mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex gap-px">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={11}
                  className={star <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              {product.rating.toFixed(1)} <span className="text-gray-300">({product.reviewCount})</span>
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-3" />

        {/* Price row */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-gray-900">{formatPrice(price)}</span>
          {product.salePrice && product.salePrice < product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
          {discount && (
            <span className="ml-auto text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Save {discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
