'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, Truck, Shield } from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import { formatPrice } from '../../../lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore();
  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const freeShippingThreshold = 499;
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-24 px-4">
          <ShoppingBag size={64} className="text-gray-200 mx-auto mb-6" />
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven&apos;t added anything yet. Explore our range of natural beauty products!</p>
          <Link href="/products" className="btn-primary px-8 py-3">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/products" className="text-gray-400 hover:text-gray-700 transition flex items-center gap-1.5 text-sm">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
          <span className="text-gray-200">|</span>
          <h1 className="font-heading text-2xl font-bold text-gray-900">
            Shopping Cart <span className="text-gray-400 font-normal text-lg">({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
          </h1>
        </div>

        {/* Free shipping progress */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          {qualifiesForFreeShipping ? (
            <div className="flex items-center gap-2 text-green-600">
              <Truck size={18} />
              <span className="text-sm font-semibold">🎉 You qualify for free shipping!</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck size={16} />
                  <span className="text-sm">Add <span className="font-semibold text-gray-900">{formatPrice(freeShippingThreshold - subtotal)}</span> more for free shipping</span>
                </div>
                <span className="text-xs text-gray-400">{formatPrice(freeShippingThreshold)} threshold</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${shippingProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => {
              const price = item.product.salePrice || item.product.price;
              return (
                <div key={`${item.product._id}-${item.variant?.value ?? ''}-${idx}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5">
                  {/* Image */}
                  <Link href={`/products/${item.product.slug}`}>
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="96px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={32} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-gray-600 transition line-clamp-1">{item.product.name}</h3>
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.product._id, item.variant)}
                        className="text-gray-300 hover:text-red-400 transition shrink-0" aria-label="Remove">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.variant)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition" aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variant)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition" aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(price * item.quantity)}</p>
                        {item.quantity > 1 && <p className="text-xs text-gray-400">{formatPrice(price)} each</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-heading text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={qualifiesForFreeShipping ? 'text-green-600 font-semibold' : 'font-semibold'}>
                    {qualifiesForFreeShipping ? 'FREE' : formatPrice(79)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">
                    {formatPrice(subtotal + (qualifiesForFreeShipping ? 0 : 79))}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full text-center flex items-center justify-center gap-2 py-3.5">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <div className="mt-5 space-y-2.5">
                {[
                  { icon: <Shield size={14} />, text: '100% Secure Checkout' },
                  { icon: <Truck size={14} />, text: 'Fast Delivery Across India' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-gray-400">{icon}</span>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
