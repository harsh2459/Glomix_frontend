'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Clock, CheckCircle, Circle, ExternalLink } from 'lucide-react';
import { IOrder } from '../../../../../types';
import { apiGet } from '../../../../../lib/api';
import { formatPrice } from '../../../../../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-600 border-red-200',
  refunded:   'bg-gray-50 text-gray-600 border-gray-200',
};

const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>(`/orders/${id}`)
      .then(res => setOrder(res?.order ?? res))
      .catch(() => router.replace('/account/orders'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
    </div>
  );

  if (!order) return null;

  const currentStepIdx = ORDER_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled' || order.orderStatus === 'refunded';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <Link href="/account/orders" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4 transition">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Clock size={13} />
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${STATUS_STYLES[order.orderStatus] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-heading text-base font-bold text-gray-900 mb-6">Order Progress</h2>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {ORDER_STEPS.map((step, idx) => {
              const done = currentStepIdx >= idx;
              const current = currentStepIdx === idx;
              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                      done ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 text-gray-300'
                    } ${current ? 'ring-2 ring-gray-900 ring-offset-2' : ''}`}>
                      {done ? <CheckCircle size={16} /> : <Circle size={16} />}
                    </div>
                    <p className={`text-xs mt-2 font-medium whitespace-nowrap ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </p>
                  </div>
                  {idx < ORDER_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${currentStepIdx > idx ? 'bg-gray-900' : 'bg-gray-100'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
              <Truck size={14} /> Track your shipment <ExternalLink size={12} />
            </a>
          )}
          {order.awb && <p className="text-xs text-gray-500 mt-1">AWB: {order.awb} {order.shippingPartner ? `· ${order.shippingPartner}` : ''}</p>}
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-heading text-base font-bold text-gray-900">Items Ordered</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 p-5">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Shipping address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-gray-400" />
            <h2 className="font-heading text-base font-bold text-gray-900">Shipping Address</h2>
          </div>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-gray-400" />
            <h2 className="font-heading text-base font-bold text-gray-900">Payment Details</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-medium capitalize">{order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`font-semibold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'failed' ? 'text-red-500' : 'text-yellow-600'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Shipping</span>
                <span>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-100 pt-1.5">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-heading text-base font-bold text-gray-900 mb-5">Order Timeline</h2>
          <div className="space-y-4">
            {[...order.timeline].reverse().map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <CheckCircle size={14} className="text-gray-500" />
                  </div>
                  {i < order.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-gray-900 capitalize">{event.status}</p>
                  {event.message && <p className="text-xs text-gray-500 mt-0.5">{event.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
