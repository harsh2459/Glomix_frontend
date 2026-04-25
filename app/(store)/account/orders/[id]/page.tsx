'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Clock, CheckCircle, Circle, ExternalLink } from 'lucide-react';
import { IOrder } from '../../../../../types';
import { apiGet } from '../../../../../lib/api';
import { formatPrice } from '../../../../../lib/utils';

const STATUS_CLASS: Record<string, string> = {
  pending:    'status-pending',
  confirmed:  'status-confirmed',
  processing: 'status-processing',
  shipped:    'status-shipped',
  delivered:  'status-delivered',
  cancelled:  'status-cancelled',
  refunded:   'status-refunded',
};

const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
  padding: '1.5rem',
};

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 128, borderRadius: 'var(--radius-xl)' }} />)}
    </div>
  );

  if (!order) return null;

  const currentStepIdx = ORDER_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled' || order.orderStatus === 'refunded';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={cardStyle}>
        <Link href="/account/orders"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
          <ArrowLeft size={14} /> Back to Orders
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>Order #{order.orderNumber}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={13} />
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={STATUS_CLASS[order.orderStatus] ?? 'status-refunded'}
            style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 9999, letterSpacing: '0.03em', textTransform: 'capitalize' }}>
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.5rem' }}>Order Progress</h2>
          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 8 }}>
            {ORDER_STEPS.map((step, idx) => {
              const done = currentStepIdx >= idx;
              const current = currentStepIdx === idx;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? 'var(--ink)' : 'var(--bg-alt)',
                      border: `2px solid ${done ? 'var(--ink)' : 'var(--border)'}`,
                      color: done ? 'var(--ink-text)' : 'var(--text-faint)',
                      outline: current ? '2px solid var(--ink)' : 'none',
                      outlineOffset: 2,
                      transition: 'all 0.2s',
                    }}>
                      {done ? <CheckCircle size={16} /> : <Circle size={16} />}
                    </div>
                    <p style={{ fontSize: 11, marginTop: 8, fontWeight: 500, whiteSpace: 'nowrap', color: done ? 'var(--text)' : 'var(--text-faint)' }}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </p>
                  </div>
                  {idx < ORDER_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 24, background: currentStepIdx > idx ? 'var(--ink)' : 'var(--border)' }} />
                  )}
                </div>
              );
            })}
          </div>

          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
              style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--info)', fontWeight: 500, textDecoration: 'none' }}>
              <Truck size={14} /> Track your shipment <ExternalLink size={12} />
            </a>
          )}
          {order.awb && <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>AWB: {order.awb} {order.shippingPartner ? `· ${order.shippingPartner}` : ''}</p>}
        </div>
      )}

      {/* Order items */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>Items Ordered</h2>
        </div>
        <div>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '1.25rem 1.5rem', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-alt)', flexShrink: 0 }}>
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="64px" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={20} style={{ color: 'var(--text-faint)' }} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, color: 'var(--text)', fontSize: 13 }}>{item.name}</p>
                {item.variant && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.variant.name}: {item.variant.value}</p>}
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>Qty: {item.quantity}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{formatPrice(item.price * item.quantity)}</p>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{formatPrice(item.price)} each</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }} className="sm:grid-cols-2">
        {/* Shipping address */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <MapPin size={15} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>Shipping Address</h2>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.8 }}>
            <p style={{ fontWeight: 600, color: 'var(--text)' }}>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Payment summary */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <CreditCard size={15} style={{ color: 'var(--text-muted)' }} />
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>Payment Details</h2>
          </div>
          <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Method</span>
              <span style={{ fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize', color: order.paymentStatus === 'paid' ? 'var(--success)' : order.paymentStatus === 'failed' ? 'var(--error)' : 'var(--warning)' }}>
                {order.paymentStatus}
              </span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-faint)' }}>Subtotal</span>
                <span style={{ color: 'var(--text-sub)' }}>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-faint)' }}>Discount</span>
                  <span style={{ color: 'var(--success)' }}>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-faint)' }}>Shipping</span>
                <span style={{ color: 'var(--text-sub)' }}>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                <span style={{ color: 'var(--text)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.1rem', color: 'var(--text)' }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.25rem' }}>Order Timeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...order.timeline].reverse().map((event, i) => (
              <div key={i} style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  {i < order.timeline.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '4px 0' }} />}
                </div>
                <div style={{ paddingBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{event.status}</p>
                  {event.message && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{event.message}</p>}
                  <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
