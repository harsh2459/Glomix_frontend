'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, MapPin, Package, ChevronRight, Clock } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { IOrder } from '../../../types';
import { apiGet } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

// Maps order status → CSS class from globals.css
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
  padding: '1.5rem',
};

export default function AccountDashboard() {
  const { user } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ orders: IOrder[] } | IOrder[]>('/orders?limit=3')
      .then(res => setRecentOrders(Array.isArray(res) ? res : (res as any).orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { href: '/account/orders',    label: 'My Orders',  sub: 'Track and manage orders',     icon: ShoppingBag },
    { href: '/account/wishlist',  label: 'Wishlist',   sub: 'Saved products',              icon: Heart },
    { href: '/account/addresses', label: 'Addresses',  sub: 'Manage delivery addresses',   icon: MapPin },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome */}
      <div style={cardStyle}>
        <h1 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage your orders, wishlist, and account details</p>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{ ...cardStyle, textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius)', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: 'var(--text)' }}>
                <Icon size={18} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{link.label}</p>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{link.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)' }}>Recent Orders</h2>
          <Link href="/account/orders" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
            View all <ChevronRight size={13} />
          </Link>
        </div>

        {loading && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        )}

        {!loading && recentOrders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Package size={38} style={{ color: 'var(--bg-muted)', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 4 }}>No orders yet</p>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: '1.25rem' }}>Start shopping to see your orders here</p>
            <Link href="/products" className="btn-primary" style={{ fontSize: 13, padding: '0.6rem 1.5rem' }}>Shop Now</Link>
          </div>
        )}

        {!loading && recentOrders.length > 0 && (
          <div>
            {recentOrders.map((order, idx) => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: idx < recentOrders.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-alt)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 'var(--radius)', background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShoppingBag size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>#{order.orderNumber}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <Clock size={10} style={{ color: 'var(--text-faint)' }} />
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                    {formatPrice(order.total)}
                  </span>
                  <span className={`${STATUS_CLASS[order.orderStatus] ?? 'status-refunded'}`}
                    style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, letterSpacing: '0.03em', textTransform: 'capitalize' }}>
                    {order.orderStatus}
                  </span>
                  <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Account info */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'var(--font-playfair, serif)', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>Account Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'Full Name',     value: user?.name },
            { label: 'Email',         value: user?.email },
            { label: 'Phone',         value: user?.phone || 'Not added' },
            { label: 'Member Since',  value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--bg-alt)', borderRadius: 'var(--radius)', padding: '10px 14px' }}>
              <p style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text-faint)', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
