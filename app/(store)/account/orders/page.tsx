'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, Clock, Search } from 'lucide-react';
import { IOrder } from '../../../../types';
import { apiGet } from '../../../../lib/api';
import { formatPrice } from '../../../../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-600 border-red-200',
  refunded:   'bg-gray-50 text-gray-600 border-gray-200',
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
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage your purchases</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
              filter === tab.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}>
            {tab.label}
            {tab.value === 'all' && orders.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({orders.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading && (
          <div className="p-6 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Package size={48} className="text-gray-200 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-gray-800 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {filter === 'all' ? "You haven't placed any orders yet" : 'Try a different filter'}
            </p>
            {filter === 'all' && <Link href="/products" className="btn-primary">Start Shopping</Link>}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-gray-100">
            {filtered.map(order => (
              <Link key={order._id} href={`/account/orders/${order._id}`}
                className="block p-5 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[order.orderStatus] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>

                {/* Product thumbnails */}
                <div className="flex items-center gap-2">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                  <span className="text-sm text-gray-500 ml-1">
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
