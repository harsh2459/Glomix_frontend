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
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
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
  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 499 ? 0 : 79;
  const total = subtotal + shippingFee;
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [orderId, setOrderId] = useState('');

  const [form, setForm] = useState<ShippingForm>({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        fullName: user.name || f.fullName,
        phone: user.phone || f.phone,
        email: user.email || f.email,
      }));
      // Pre-fill default address if available
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

  useEffect(() => {
    if (items.length === 0 && step !== 'success') router.replace('/cart');
  }, [items, step, router]);

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
    } finally {
      setCouponLoading(false);
    }
  };

  const validateShipping = () => {
    const required: (keyof ShippingForm)[] = ['fullName', 'phone', 'email', 'addressLine1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!form[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!/^\d{10}$/.test(form.phone)) { toast.error('Enter a valid 10-digit phone number'); return false; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter a valid 6-digit pincode'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Enter a valid email address'); return false; }
    return true;
  };

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise(resolve => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrder = async () => {
    if (!validateShipping()) return;
    setPlacing(true);
    try {
      const orderPayload = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          variant: item.variant,
        })),
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        },
        paymentMethod,
        couponCode: couponCode || undefined,
        customerEmail: form.email,
      };

      if (paymentMethod === 'razorpay') {
        const loaded = await loadRazorpay();
        if (!loaded) { toast.error('Payment gateway failed to load. Try again.'); setPlacing(false); return; }

        const rpOrder = await apiPost<{ id: string; amount: number; currency: string; key: string }>('/payments/create-order', {
          amount: total - discount,
        });

        const options = {
          key: rpOrder.key,
          amount: rpOrder.amount,
          currency: rpOrder.currency,
          name: 'Glomix',
          description: 'Natural Beauty Products',
          order_id: rpOrder.id,
          prefill: { name: form.fullName, email: form.email, contact: form.phone },
          theme: { color: '#111827' },
          handler: async (response: any) => {
            try {
              const confirmed = await apiPost<{ orderNumber: string }>('/orders', {
                ...orderPayload,
                razorpayOrderId: rpOrder.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setOrderId(confirmed.orderNumber);
              clearCart();
              setStep('success');
            } catch { toast.error('Order confirmation failed. Contact support.'); }
          },
          modal: { ondismiss: () => setPlacing(false) },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // COD
      const order = await apiPost<{ orderNumber: string }>('/orders', orderPayload);
      setOrderId(order.orderNumber);
      clearCart();
      setStep('success');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-md w-full text-center shadow-lg">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-500" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-2">Thank you for your purchase</p>
          {orderId && <p className="text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg px-4 py-2 mb-6">Order: #{orderId}</p>}
          <p className="text-sm text-gray-500 mb-8">You&apos;ll receive a confirmation email shortly. We&apos;ll notify you when your order ships.</p>
          <div className="flex flex-col gap-3">
            <Link href="/account/orders" className="btn-primary w-full">Track My Orders</Link>
            <Link href="/products" className="btn-outline w-full">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-8">
          <Link href="/cart" className="hover:text-gray-800 transition">Cart</Link>
          <ChevronRight size={12} />
          <span className="text-gray-800 font-medium">Checkout</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Lock size={20} className="text-gray-400" />
          <h1 className="font-heading text-2xl font-bold text-gray-900">Secure Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-heading text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Truck size={18} className="text-gray-400" /> Shipping Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'fullName', label: 'Full Name', placeholder: 'Priya Sharma', col: 'sm:col-span-2' },
                  { name: 'email', label: 'Email Address', placeholder: 'priya@example.com', type: 'email' },
                  { name: 'phone', label: 'Phone Number', placeholder: '9876543210', type: 'tel' },
                  { name: 'addressLine1', label: 'Address Line 1', placeholder: 'Flat/House No., Street', col: 'sm:col-span-2' },
                  { name: 'addressLine2', label: 'Address Line 2 (Optional)', placeholder: 'Landmark, Colony', col: 'sm:col-span-2' },
                  { name: 'city', label: 'City', placeholder: 'Mumbai' },
                  { name: 'pincode', label: 'Pincode', placeholder: '400001', type: 'tel' },
                ].map(field => (
                  <div key={field.name} className={field.col ?? ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type ?? 'text'}
                      value={form[field.name as keyof ShippingForm]}
                      onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="input"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                  <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="input">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                  <input type="text" value={form.country} readOnly className="input bg-gray-50 cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-heading text-lg font-bold text-gray-900 mb-5">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'razorpay', label: 'Pay Online', sub: 'UPI, Cards, Net Banking, Wallets', badge: 'Recommended' },
                  { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive your order', badge: null },
                ].map(method => (
                  <label key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === method.value ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="payment" value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value as 'razorpay' | 'cod')}
                      className="w-4 h-4 accent-gray-900" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{method.label}</span>
                        {method.badge && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{method.badge}</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{method.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-5">
              <h2 className="font-heading text-lg font-bold text-gray-900">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={`${item.product._id}-${idx}`} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      {item.product.images[0] && (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                      {item.variant && <p className="text-xs text-gray-400">{item.variant.value}</p>}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice((item.product.salePrice || item.product.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Have a coupon?</p>
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE" className="input text-sm h-10 flex-1 uppercase tracking-wider" />
                  <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode}
                    className="btn-outline text-sm px-4 h-10 shrink-0 disabled:opacity-50">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-1.5">✓ Coupon applied — {formatPrice(discount)} off!</p>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon Discount</span>
                    <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2.5">
                  <span>Total</span>
                  <span>{formatPrice(total - discount)}</span>
                </div>
              </div>

              <button onClick={placeOrder} disabled={placing}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
                <Lock size={16} />
                {placing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
              </button>

              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                <Lock size={10} /> 256-bit SSL secured checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
