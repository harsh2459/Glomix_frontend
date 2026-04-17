'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, MapPin, Package, ChevronRight, Clock } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { IOrder } from '../../../types';
import { apiGet } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-600 border-red-200',
  refunded:   'bg-gray-50 text-gray-600 border-gray-200',
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
    { href: '/account/orders', label: 'My Orders', sub: 'Track and manage orders', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { href: '/account/wishlist', label: 'Wishlist', sub: 'Saved products', icon: Heart, color: 'bg-pink-50 text-pink-600' },
    { href: '/account/addresses', label: 'Addresses', sub: 'Manage delivery addresses', icon: MapPin, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm">Manage your orders, wishlist, and account details</p>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-sm transition group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${link.color}`}>
                <Icon size={20} />
              </div>
              <p className="font-semibold text-gray-900 text-sm group-hover:text-gray-600 transition">{link.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{link.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-heading text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading && (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        )}

        {!loading && recentOrders.length === 0 && (
          <div className="text-center py-14">
            <Package size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Start shopping to see your orders here</p>
            <Link href="/products" className="btn-primary text-sm px-6 py-2.5">Shop Now</Link>
          </div>
        )}

        {!loading && recentOrders.length > 0 && (
          <div className="divide-y divide-gray-100">
            {recentOrders.map(order => (
              <Link key={order._id} href={`/account/orders/${order._id}`}
                className="flex items-center justify-between p-5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <ShoppingBag size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">#{order.orderNumber}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-sm text-gray-900">{formatPrice(order.total)}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.orderStatus] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-heading text-lg font-bold text-gray-900 mb-4">Account Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Phone', value: user?.phone || 'Not added' },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
