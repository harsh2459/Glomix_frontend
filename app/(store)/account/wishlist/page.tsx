'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { IProduct } from '../../../../types';
import { apiGet, apiPost } from '../../../../lib/api';
import { formatPrice } from '../../../../lib/utils';
import { useCartStore } from '../../../../stores/cartStore';
import { useAuthStore } from '../../../../stores/authStore';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCartStore();
  const { fetchUser } = useAuthStore();

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
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Wishlist</h1>
        <p className="text-gray-500 text-sm mt-1">Your saved products ({products.length})</p>
      </div>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton rounded-2xl aspect-[3/4]" />)}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
          <Heart size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Save products you love and shop them later</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:border-gray-300 hover:shadow-sm transition">
              <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={40} className="text-gray-200" />
                  </div>
                )}
                {product.salePrice && product.salePrice < product.price && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">SALE</span>
                )}
              </Link>
              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-gray-600 transition">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-bold text-gray-900">{formatPrice(product.salePrice || product.price)}</span>
                  {product.salePrice && product.salePrice < product.price && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-900 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition">
                    <ShoppingBag size={13} /> Add to Cart
                  </button>
                  <button onClick={() => removeFromWishlist(product._id)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition text-gray-400">
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
