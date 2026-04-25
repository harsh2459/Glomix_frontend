'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Lock, Truck, ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '../../../stores/cartStore';
import { useAuthStore } from '../../../stores/authStore';
import { formatPrice } from '../../../lib/utils';
import { apiPost } from '../../../lib/api';
import toast from 'react-hot-toast';

interface ShippingForm {
  fullName: string; phone: string; email: string;
  addressLine1: string; addressLine2: string;
  city: string; state: string; pincode: string; country: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
  'Chandigarh','Puducherry','Andaman and Nicobar Islands','Dadra and Nagar Haveli','Lakshadweep',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const subtotal    = getSubtotal();
  const shippingFee = subtotal >= 499 ? 0 : 79;
  const total       = subtotal + shippingFee;
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount]     = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing]       = useState(false);
  const [step, setStep]             = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [orderId, setOrderId]       = useState('');

  const [form, setForm] = useState<ShippingForm>({
    fullName: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India',
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, fullName: user.name || f.fullName, phone: user.phone || f.phone, email: user.email || f.email }));
      const defaultAddr = user.addresses?.find(a => a.isDefault) ?? user.addresses?.[0];
      if (defaultAddr) {
        setForm(f => ({
          ...f,
          addressLine1: defaultAddr.addressLine1 || f.addressLine1,
          addressLine2: defaultAddr.addressLine2 || f.addressLine2,
          city: defaultAddr.city || f.city,
          state: defaultAddr.state || f.state,
          pincode: defaultAddr.pincode || f.pincode,
        }));
      }
    }
  }, [user]);

  useEffect(() => { if (items.length === 0 && step !== 'success') router.replace('/cart'); }, [items, step, router]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await apiPost<{ discount: number }>('/coupons/validate', { code: couponCode, subtotal });
      setDiscount(res.discount);
      toast.success(`Coupon applied! You saved ${formatPrice(res.discount)}`);
    } catch {
      toast.error('Invalid or expired coupon code');
      setDiscount(0);
    } finally { setCouponLoading(false); }
  };

  const validateShipping = () => {
    const required: (keyof ShippingForm)[] = ['fullName','phone','email','addressLine1','city','state','pincode'];
    for (const field of required) {
      if (!form[field].trim()) { toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`); return false; }
    }
    if (!/^\d{10}$/.test(form.phone)) { toast.error('Enter a valid 10-digit phone number'); return false; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter a valid 6-digit pincode'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Enter a valid email address'); return false; }
    return true;
  };

  const loadRazorpay = (): Promise<boolean> => new Promise(resolve => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const placeOrder = async () => {
    if (!validateShipping()) return;
    setPlacing(true);
    try {
      const orderPayload = {
        items: items.map(item => ({ product: item.product._id, quantity: item.quantity, variant: item.variant })),
        shippingAddress: { fullName: form.fullName, phone: form.phone, addressLine1: form.addressLine1, addressLine2: form.addressLine2, city: form.city, state: form.state, pincode: form.pincode, country: form.country },
        paymentMethod,
        couponCode: couponCode || undefined,
        customerEmail: form.email,
      };

      if (paymentMethod === 'razorpay') {
        const loaded = await loadRazorpay();
        if (!loaded) { toast.error('Payment gateway failed to load. Try again.'); setPlacing(false); return; }
        const rpOrder = await apiPost<{ id: string; amount: number; currency: string; key: string }>('/payments/create-order', { amount: total - discount });
        const options = {
          key: rpOrder.key, amount: rpOrder.amount, currency: rpOrder.currency,
          name: 'Glomix', description: 'Natural Beauty Products', order_id: rpOrder.id,
          prefill: { name: form.fullName, email: form.email, contact: form.phone },
          theme: { color: '#0a0a0a' },
          handler: async (response: any) => {
            try {
              const confirmed = await apiPost<{ orderNumber: string }>('/orders', {
                ...orderPayload,
                razorpayOrderId: rpOrder.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setOrderId(confirmed.orderNumber); clearCart(); setStep('success');
            } catch { toast.error('Order confirmation failed. Contact support.'); }
          },
          modal: { ondismiss: () => setPlacing(false) },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }
      const order = await apiPost<{ orderNumber: string }>('/orders', orderPayload);
      setOrderId(order.orderNumber); clearCart(); setStep('success');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to place order. Please try again.');
    } finally { setPlacing(false); }
  };

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-deep)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Check size={34} style={{ color: 'var(--success)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>Order Placed!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: 14 }}>Thank you for your purchase</p>
          {orderId && (
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', background: 'var(--bg-alt)', borderRadius: 'var(--radius)', padding: '8px 16px', display: 'inline-block', marginBottom: '1.5rem' }}>
              Order: #{orderId}
            </p>
          )}
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.65 }}>
            You&apos;ll receive a confirmation email shortly. We&apos;ll notify you when your order ships.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/account/orders" className="btn-primary" style={{ justifyContent: 'center' }}>Track My Orders</Link>
            <Link href="/products" className="btn-outline" style={{ justifyContent: 'center' }}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 1rem',
    background: 'var(--surface)', border: '1.5px solid var(--border-strong)',
    borderRadius: 'var(--radius)', color: 'var(--text)',
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 500,
    color: 'var(--text-sub)', marginBottom: 6, letterSpacing: '0.02em',
  };
  const sectionCardStyle: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '1.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-alt)' }}>
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <Link href="/cart" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
            Cart
          </Link>
          <ChevronRight size={11} />
          <span style={{ color: 'var(--text)', fontWeight: 500 }}>Checkout</span>
        </nav>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
          <Lock size={18} style={{ color: 'var(--text-faint)' }} />
          <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>
            Secure Checkout
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg:grid-cols-3">

          {/* Left — Form */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Shipping */}
            <div style={sectionCardStyle}>
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={16} style={{ color: 'var(--text-faint)' }} /> Shipping Details
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { name: 'fullName',     label: 'Full Name',              placeholder: 'Priya Sharma',        span: true },
                  { name: 'email',        label: 'Email Address',          placeholder: 'priya@example.com',   type: 'email' },
                  { name: 'phone',        label: 'Phone Number',           placeholder: '9876543210',          type: 'tel' },
                  { name: 'addressLine1', label: 'Address Line 1',         placeholder: 'Flat/House No., Street', span: true },
                  { name: 'addressLine2', label: 'Address Line 2 (Optional)', placeholder: 'Landmark, Colony', span: true },
                  { name: 'city',         label: 'City',                   placeholder: 'Mumbai' },
                  { name: 'pincode',      label: 'Pincode',                placeholder: '400001',              type: 'tel' },
                ].map(field => (
                  <div key={field.name} style={{ gridColumn: field.span ? 'span 2' : 'span 1' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                      type={field.type ?? 'text'}
                      value={form[field.name as keyof ShippingForm]}
                      onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={inputStyle}
                      onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--text)'}
                      onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border-strong)'}
                    />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>State</label>
                  <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} style={inputStyle}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input type="text" value={form.country} readOnly style={{ ...inputStyle, background: 'var(--bg-alt)', cursor: 'not-allowed' }} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div style={sectionCardStyle}>
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>
                Payment Method
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { value: 'razorpay', label: 'Pay Online', sub: 'UPI, Cards, Net Banking, Wallets', badge: 'Recommended' },
                  { value: 'cod',      label: 'Cash on Delivery', sub: 'Pay when you receive your order', badge: null },
                ].map(method => (
                  <label
                    key={method.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                      borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      border: `2px solid ${paymentMethod === method.value ? 'var(--text)' : 'var(--border)'}`,
                      background: paymentMethod === method.value ? 'var(--bg-alt)' : 'transparent',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                  >
                    <input type="radio" name="payment" value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value as 'razorpay' | 'cod')}
                      style={{ width: 15, height: 15, accentColor: 'var(--text)', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{method.label}</span>
                        {method.badge && (
                          <span style={{ fontSize: 10, background: 'var(--success-bg)', color: 'var(--success)', padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{method.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Summary */}
          <div>
            <div style={{ ...sectionCardStyle, position: 'sticky', top: 88 }}>
              <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>
                Order Summary
              </h2>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 210, overflowY: 'auto', marginBottom: '1.25rem' }}>
                {items.map((item, idx) => (
                  <div key={`${item.product._id}-${idx}`} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ position: 'relative', width: 52, height: 52, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-alt)', flexShrink: 0 }}>
                      {item.product.images[0] && <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} sizes="52px" />}
                      <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: 'var(--text)', color: 'var(--ink-text)', fontSize: 9, fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.35 }} className="line-clamp-1">{item.product.name}</p>
                      {item.variant && <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>{item.variant.value}</p>}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>
                      {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 8 }}>Have a coupon?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    style={{ ...inputStyle, flex: 1, height: 38, fontSize: 12, letterSpacing: '0.06em', borderRadius: 'var(--radius)', padding: '0 12px' }}
                    onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--text)'}
                    onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--border-strong)'}
                  />
                  <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}
                    style={{ flexShrink: 0, height: 38, padding: '0 14px', background: 'var(--text)', color: 'var(--ink-text)', border: 'none', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 500, cursor: couponLoading || !couponCode ? 'not-allowed' : 'pointer', opacity: couponLoading || !couponCode ? 0.5 : 1, fontFamily: 'inherit', transition: 'opacity 0.2s' }}>
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {discount > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500, marginTop: 6 }}>✓ Coupon applied — {formatPrice(discount)} off!</p>
                )}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: 500, color: 'var(--text)' }}>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--success)' }}>Coupon Discount</span>
                    <span style={{ color: 'var(--success)', fontWeight: 500 }}>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ fontWeight: 500, color: shippingFee === 0 ? 'var(--success)' : 'var(--text)' }}>
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>
                    {formatPrice(total - discount)}
                  </span>
                </div>
              </div>

              <button onClick={placeOrder} disabled={placing}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.875rem', background: placing ? 'var(--ink-hover)' : 'var(--ink)', color: 'var(--ink-text)', border: 'none', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500, letterSpacing: '0.04em', cursor: placing ? 'not-allowed' : 'pointer', opacity: placing ? 0.7 : 1, fontFamily: 'inherit', transition: 'all 0.2s' }}>
                <Lock size={14} />
                {placing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
              </button>

              <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Lock size={9} /> 256-bit SSL secured checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
