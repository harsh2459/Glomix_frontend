'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { IOrder } from '../../../../types';
import { apiGet } from '../../../../lib/api';
import { formatPrice } from '../../../../lib/utils';

const STATUS_CLASS: Record<string, string> = {
  pending:    'status-pending',
  confirmed:  'status-confirmed',
  processing: 'status-processing',
  shipped:    'status-shipped',
  delivered:  'status-delivered',
  cancelled:  'status-cancelled',
  refunded:   'status-refunded',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiGet<any>('/orders?limit=50')
      .then(res => setOrders(Array.isArray(res) ? res : res?.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  const statusTabs = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ ...cardStyle, padding: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)' }}>My Orders</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Track and manage your purchases</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {statusTabs.map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            style={{
              padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              background: filter === tab.value ? 'var(--ink)' : 'var(--surface)',
              color: filter === tab.value ? 'var(--ink-text)' : 'var(--text-muted)',
              border: `1px solid ${filter === tab.value ? 'var(--ink)' : 'var(--border)'}`,
            }}>
            {tab.label}
            {tab.value === 'all' && orders.length > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({orders.length})</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {loading && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 'var(--radius-xl)' }} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
            <Package size={48} style={{ color: 'var(--bg-muted)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '1.5rem' }}>
              {filter === 'all' ? "You haven't placed any orders yet" : 'Try a different filter'}
            </p>
            {filter === 'all' && <Link href="/products" className="btn-primary" style={{ fontSize: 13, padding: '0.6rem 1.5rem' }}>Start Shopping</Link>}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div>
            {filtered.map((order, idx) => (
              <Link key={order._id} href={`/account/orders/${order._id}`}
                style={{
                  display: 'block', padding: '1.25rem', textDecoration: 'none',
                  borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-alt)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>#{order.orderNumber}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                      <Clock size={12} style={{ color: 'var(--text-faint)' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{formatPrice(order.total)}</span>
                    <span className={STATUS_CLASS[order.orderStatus] ?? 'status-refunded'}
                      style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, letterSpacing: '0.03em', textTransform: 'capitalize' }}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                    <ChevronRight size={16} style={{ color: 'var(--text-faint)' }} />
                  </div>
                </div>

                {/* Product thumbnails */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} style={{ position: 'relative', width: 48, height: 48, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-alt)', border: '1px solid var(--border)', flexShrink: 0 }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={16} style={{ color: 'var(--text-faint)' }} />
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                      +{order.items.length - 4}
                    </div>
                  )}
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
