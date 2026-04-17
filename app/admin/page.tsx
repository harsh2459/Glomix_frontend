'use client';
import { useEffect, useState } from 'react';
import { ShoppingCart, Package, Users, TrendingUp, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';
import { apiGet } from '../../lib/api';
import Link from 'next/link';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../lib/utils';
import { IOrder } from '../../types';

interface Analytics { totalOrders: number; monthOrders: number; totalRevenue: number; pendingOrders: number; }

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<Analytics>('/admin/orders/analytics'),
      apiGet<{ data: IOrder[] }>('/admin/orders?limit=5').catch(() => ({ data: [] })),
    ]).then(([a, o]) => {
      setAnalytics(a);
      setRecentOrders((o as unknown as { data: IOrder[] }).data ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Revenue', value: analytics ? formatPrice(analytics.totalRevenue) : '—', icon: TrendingUp, color: 'text-green-400', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Total Orders', value: analytics?.totalOrders ?? '—', icon: ShoppingCart, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
    { label: 'This Month', value: analytics?.monthOrders ?? '—', icon: Package, color: 'text-gray-600', bg: 'rgba(0,0,0,0.05)' },
    { label: 'Pending Orders', value: analytics?.pendingOrders ?? '—', icon: AlertCircle, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)', urgent: (analytics?.pendingOrders ?? 0) > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon size={20} className={stat.color} />
                </div>
                {stat.urgent && <span className="badge badge-warning text-xs">Action needed</span>}
              </div>
              <div className="text-2xl font-bold mb-1">{loading ? <div className="skeleton h-7 w-24 rounded" /> : stat.value}</div>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/products/new', label: 'Add Product', color: 'var(--color-primary)' },
          { href: '/admin/orders', label: 'View Orders', color: '#60A5FA' },
          { href: '/admin/settings/content', label: 'Edit Content', color: '#374151' },
          { href: '/admin/settings/theme', label: 'Edit Theme', color: '#34D399' },
          { href: '/admin/settings/general', label: 'General Settings', color: '#F59E0B' },
          { href: '/admin/banners', label: 'Manage Banners', color: '#8B5CF6' },
          { href: '/admin/coupons', label: 'Coupons', color: '#EC4899' },
          { href: '/admin/settings/footer', label: 'Footer & Links', color: '#6B7280' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card p-4 flex items-center justify-between hover:scale-105 transition-transform">
            <span className="text-sm font-medium">{item.label}</span>
            <ArrowUpRight size={16} style={{ color: item.color }} />
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-gray-600 hover:text-gray-500 transition-colors">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-40" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Order</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium hidden md:table-cell">Date</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <Link href={`/admin/orders/${order._id}`} className="font-medium hover:text-gray-500 transition-colors">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-gray-400 hidden md:table-cell">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDate(order.createdAt)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`badge text-xs ${ORDER_STATUS_COLORS[order.orderStatus] ?? ''}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
