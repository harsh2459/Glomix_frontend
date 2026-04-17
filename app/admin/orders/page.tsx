'use client';
import { useEffect, useState } from 'react';
import { Package, Eye, ChevronDown, Search, Truck, Check } from 'lucide-react';
import { apiGet, apiPut, apiPost } from '../../../lib/api';
import { IOrder, PaginatedResponse } from '../../../types';
import { formatPrice, formatDate, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '../../../lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [shipping, setShipping] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiGet<unknown>(`/admin/orders?${params}`);
      const r = res as { data: IOrder[]; pagination: { total: number; pages: number } };
      setOrders(r.data ?? []);
      setTotal(r.pagination?.total ?? 0);
      setPages(r.pagination?.pages ?? 1);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, [page, search, statusFilter]); // eslint-disable-line

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiPut(`/admin/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      loadOrders();
      if (selectedOrder?._id === orderId) setSelectedOrder((o) => o ? { ...o, orderStatus: status as IOrder['orderStatus'] } : null);
    } catch { toast.error('Update failed'); }
  };

  const createShipment = async (orderId: string) => {
    setShipping(true);
    try {
      await apiPost(`/admin/orders/${orderId}/ship`);
      toast.success('Shipment created on Shiprocket!');
      loadOrders();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Shipment creation failed');
    } finally { setShipping(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search order #..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-8 w-48 text-sm h-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-40 text-sm h-9">
          <option value="">All Status</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex gap-4">
        {/* Orders table */}
        <div className={`card overflow-hidden ${selectedOrder ? 'flex-1' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400">
                  <th className="text-left py-3 px-4 font-medium">Order</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Payment</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Total</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="skeleton h-6 rounded" /></td></tr>
                )) : orders.map((order) => (
                  <tr key={order._id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedOrder?._id === order._id ? 'bg-gray-700/5' : ''}`} onClick={() => setSelectedOrder(order)}>
                    <td className="py-3 px-4 font-medium text-gray-500">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-gray-400 hidden md:table-cell text-xs">{formatDate(order.createdAt)}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className={`badge text-xs ${PAYMENT_STATUS_COLORS[order.paymentStatus] ?? ''}`}>{order.paymentStatus}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.orderStatus}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`badge text-xs cursor-pointer bg-transparent border-0 outline-none ${ORDER_STATUS_COLORS[order.orderStatus] ?? ''}`}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="btn-ghost p-1.5 text-gray-400 hover:text-gray-900">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded text-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>

        {/* Order detail panel */}
        {selectedOrder && (
          <div className="w-80 shrink-0 space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-900 text-lg leading-none">&times;</button>
              </div>
              <p className="text-gray-500 font-mono text-sm mb-1">{selectedOrder.orderNumber}</p>
              <p className="text-gray-400 text-xs mb-3">{formatDate(selectedOrder.createdAt)}</p>

              <div className="space-y-2 mb-4">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-300">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatPrice(selectedOrder.discount)}</span></div>}
                <div className="flex justify-between text-gray-400"><span>Shipping</span><span>{selectedOrder.shippingCharge === 0 ? 'Free' : formatPrice(selectedOrder.shippingCharge)}</span></div>
                <div className="flex justify-between font-bold mt-1"><span>Total</span><span>{formatPrice(selectedOrder.total)}</span></div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Shipping Address</h4>
              <div className="text-sm text-gray-300 space-y-0.5">
                <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.addressLine1}</p>
                {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                <p className="text-gray-500">{selectedOrder.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Shiprocket */}
            {!selectedOrder.awb && selectedOrder.paymentStatus === 'paid' && (
              <button
                onClick={() => createShipment(selectedOrder._id)}
                disabled={shipping}
                className="btn-primary w-full gap-2 text-sm"
              >
                <Truck size={14} />
                {shipping ? 'Creating...' : 'Create Shipment (Shiprocket)'}
              </button>
            )}
            {selectedOrder.awb && (
              <div className="card p-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tracking</h4>
                <p className="text-sm"><span className="text-gray-400">AWB:</span> <span className="font-mono text-gray-500">{selectedOrder.awb}</span></p>
                {selectedOrder.shippingPartner && <p className="text-sm text-gray-400 mt-1">via {selectedOrder.shippingPartner}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
