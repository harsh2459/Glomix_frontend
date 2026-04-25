'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, Truck, Shield } from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import { formatPrice } from '../../../lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getTotalItems } = useCartStore();
  const subtotal   = getSubtotal();
  const totalItems = getTotalItems();
  const freeShippingThreshold = 499;
  const shippingProgress      = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
          <ShoppingBag size={56} style={{ color: 'var(--bg-muted)', margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>
            Your cart is empty
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
            Looks like you haven&apos;t added anything yet. Explore our range of natural beauty products!
          </p>
          <Link href="/products" className="btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-alt)' }}>
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
            <ArrowLeft size={15} /> Continue Shopping
          </Link>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>
            Shopping Cart <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '1rem' }}>({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
          </h1>
        </div>

        {/* Free shipping bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '14px 20px', marginBottom: '1.5rem' }}>
          {qualifiesForFreeShipping ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontSize: 13, fontWeight: 500 }}>
              <Truck size={16} />
              <span>🎉 You qualify for free shipping!</span>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                  <Truck size={15} />
                  <span>Add <strong style={{ color: 'var(--text)' }}>{formatPrice(freeShippingThreshold - subtotal)}</strong> more for free shipping</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{formatPrice(freeShippingThreshold)} threshold</span>
              </div>
              <div style={{ height: 5, background: 'var(--bg-muted)', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--success)', borderRadius: 9999, width: `${shippingProgress}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-3">
          <div style={{ gridColumn: 'span 2' }} className="space-y-4">
            {items.map((item, idx) => {
              const price = item.product.salePrice || item.product.price;
              return (
                <div
                  key={`${item.product._id}-${item.variant?.value ?? ''}-${idx}`}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', display: 'flex', gap: '1.25rem' }}
                >
                  {/* Image */}
                  <Link href={`/products/${item.product.slug}`} style={{ flexShrink: 0 }}>
                    <div style={{ width: 90, height: 90, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-alt)', position: 'relative' }}>
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} sizes="90px" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={28} style={{ color: 'var(--bg-muted)' }} />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }} className="line-clamp-1">{item.product.name}</h3>
                        </Link>
                        {item.variant && (
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{item.variant.name}: {item.variant.value}</p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.product._id, item.variant)}
                        aria-label="Remove"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: 4, flexShrink: 0, transition: 'color 0.2s', display: 'flex' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--error)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                      {/* Qty control */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.variant)}
                          aria-label="Decrease"
                          style={{ width: 34, height: 34, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-alt)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                          <Minus size={13} />
                        </button>
                        <span style={{ width: 36, textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variant)}
                          aria-label="Increase"
                          style={{ width: 34, height: 34, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-alt)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                          <Plus size={13} />
                        </button>
                      </div>
                      {/* Price */}
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>{formatPrice(price * item.quantity)}</p>
                        {item.quantity > 1 && <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>{formatPrice(price)} each</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', position: 'sticky', top: 88 }}>
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>Order Summary</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal ({totalItems} items)</span>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ fontWeight: 500, color: qualifiesForFreeShipping ? 'var(--success)' : 'var(--text)' }}>
                    {qualifiesForFreeShipping ? 'FREE' : formatPrice(79)}
                  </span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>
                    {formatPrice(subtotal + (qualifiesForFreeShipping ? 0 : 79))}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <Shield size={13} />, text: '100% Secure Checkout' },
                  { icon: <Truck size={13} />, text: 'Fast Delivery Across India' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-faint)' }}>
                    {icon} {text}
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
