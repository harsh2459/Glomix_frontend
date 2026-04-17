'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { IProduct } from '../../types';
import { formatPrice, getDiscountPercent, cn } from '../../lib/utils';
import { useCartStore } from '../../stores/cartStore';

interface ProductCardProps {
  product: IProduct;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const discount = getDiscountPercent(product.price, product.salePrice);
  const price = product.salePrice || product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Link href={`/products/${product.slug}`} className={cn('card group block', className)}>
      {/* Image */}
      <div className="relative aspect-product overflow-hidden bg-gray-100">
        {product.images[0] && !imgError ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingBag size={40} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="badge bg-red-500 text-white text-xs px-2 py-0.5">-{discount}%</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-700 text-gray-300 text-xs px-2 py-0.5">Out of Stock</span>
          )}
          {product.isFeatured && !discount && (
            <span className="badge badge-primary text-xs px-2 py-0.5">Featured</span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button
            aria-label="Add to wishlist"
            className="w-9 h-9 rounded-full glass flex items-center justify-center hover:text-red-400 transition-colors"
            onClick={(e) => { e.preventDefault(); }}
          >
            <Heart size={15} />
          </button>
          <button
            aria-label="Quick view"
            className="w-9 h-9 rounded-full glass flex items-center justify-center hover:text-gray-700 transition-colors"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/products/${product.slug}`); }}
          >
            <Eye size={15} />
          </button>
        </div>

        {/* Add to cart hover bar */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary w-full rounded-none py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={14} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
          {typeof product.category === 'object' ? product.category.name : ''}
        </p>
        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-gray-500 transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={11}
                  className={star <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-base">{formatPrice(price)}</span>
          {product.salePrice && product.salePrice < product.price && (
            <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
