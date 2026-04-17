'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice, getDiscountPercent } from '../../lib/utils';
import Image from 'next/image';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore();
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-300 ease-in-out`}
        style={{
          background: 'var(--color-surface)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-gray-600" />
            <span className="font-heading text-lg font-semibold">Your Cart</span>
            {totalItems > 0 && (
              <span className="badge badge-primary">{totalItems}</span>
            )}
          </div>
          <button onClick={closeCart} className="btn-ghost p-2" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
              <ShoppingBag size={48} className="text-gray-600" />
              <div>
                <p className="text-lg font-semibold text-gray-300">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add some products to get started</p>
              </div>
              <Link href="/products" onClick={closeCart} className="btn-primary mt-2">
                Shop Now
              </Link>
            </div>
          ) : (
            items.map((item, idx) => {
              const price = item.product.salePrice || item.product.price;
              return (
                <div
                  key={`${item.product._id}-${item.variant?.value ?? ''}-${idx}`}
                  className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-700/20 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-black/20">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                      <p className="text-sm font-medium truncate hover:text-gray-500 transition-colors">
                        {item.product.name}
                      </p>
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <p className="text-sm font-bold text-gray-500 mt-1">{formatPrice(price)}</p>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.variant)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variant)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-gray-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.product._id, item.variant)}
                        className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
            </div>
            {subtotal < 499 && (
              <p className="text-xs text-yellow-400 text-center">
                Add {formatPrice(499 - subtotal)} more for free shipping!
              </p>
            )}
            {subtotal >= 499 && (
              <p className="text-xs text-green-400 text-center">🎉 You qualify for free shipping!</p>
            )}
            <Link href="/checkout" onClick={closeCart} className="btn-primary w-full text-center">
              Proceed to Checkout
            </Link>
            <button onClick={closeCart} className="btn-ghost w-full text-sm text-gray-400 hover:text-gray-900">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
