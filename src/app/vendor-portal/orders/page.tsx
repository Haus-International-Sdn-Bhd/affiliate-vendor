'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { vendorApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { VendorOrder, VendorOrderItem, VendorOrderMetrics } from '@/lib/types';
import {
  ShoppingCart,
  Search,
  Filter,
  RefreshCw,
  PackageCheck,
  Truck,
  Clock,
  DollarSign,
  Eye,
  X,
  ExternalLink,
  MapPin,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Layers,
  AlertCircle,
} from 'lucide-react';

export default function VendorOrdersPage() {
  const { brand, activeBrandId } = useAuth();

  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [metrics, setMetrics] = useState<VendorOrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vendorApi.getOrders({
        page,
        per_page: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (res) {
        setOrders(res.data || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
        setTotalPages(res.last_page || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load vendor orders', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, activeBrandId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPage(1);
  };

  const handleViewOrder = async (order: VendorOrder) => {
    setSelectedOrder(order);
    try {
      setDetailLoading(true);
      const res = await vendorApi.getOrder(order.uuid || order.id);
      if (res?.order) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      console.error('Failed to load full order details', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'paid':
      case 'completed':
      case 'delivered':
        return <span className="badge badge-success badge-sm font-bold uppercase text-[10px]">{s}</span>;
      case 'processing':
        return <span className="badge badge-primary badge-sm font-bold uppercase text-[10px]">{s}</span>;
      case 'shipped':
        return <span className="badge badge-info badge-sm font-bold uppercase text-[10px]">{s}</span>;
      case 'pending':
        return <span className="badge badge-warning badge-sm font-bold uppercase text-[10px]">{s}</span>;
      case 'cancelled':
      case 'failed':
        return <span className="badge badge-error badge-sm font-bold uppercase text-[10px]">{s}</span>;
      default:
        return <span className="badge badge-ghost badge-sm font-bold uppercase text-[10px]">{s || 'unknown'}</span>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary badge-outline text-[10px] font-bold uppercase tracking-wider">
              Multi-Brand Split Orders
            </span>
            <span className="text-xs text-base-content/50">•</span>
            <span className="text-xs text-base-content/60 font-medium">
              {brand?.name ? `Brand: ${brand.name}` : 'Vendor Portal'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-base-content tracking-tight mt-1">
            Order Fulfillment
          </h1>
          <p className="text-xs text-base-content/60 mt-1 max-w-2xl">
            View orders containing your brand items. In multi-brand checkouts, line items belonging to other brands are strictly excluded for business privacy.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders()}
          disabled={loading}
          className="btn btn-outline btn-sm rounded-xl font-bold gap-2 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Overview Cards (Overlay Icon Pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-base-content">{metrics?.total_orders ?? totalCount}</p>
            <p className="text-[11px] text-base-content/50">Containing brand products</p>
          </div>
          <ShoppingCart className="pointer-events-none absolute -bottom-3 -right-3 w-16 h-16 text-primary/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Ready to Process / Processing */}
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Processing</p>
            <p className="text-2xl font-black text-warning">{metrics?.pending_processing ?? 0}</p>
            <p className="text-[11px] text-base-content/50">Awaiting pack & ship</p>
          </div>
          <Clock className="pointer-events-none absolute -bottom-3 -right-3 w-16 h-16 text-warning/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* In Transit */}
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Shipped</p>
            <p className="text-2xl font-black text-info">{metrics?.shipped ?? 0}</p>
            <p className="text-[11px] text-base-content/50">Courier dispatched</p>
          </div>
          <Truck className="pointer-events-none absolute -bottom-3 -right-3 w-16 h-16 text-info/10 transition-all duration-300 group-hover:scale-110" />
        </div>

        {/* Vendor Subtotal Revenue */}
        <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="relative z-10 space-y-1">
            <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Brand Items Revenue</p>
            <p className="text-2xl font-black text-success">
              {formatCurrency(metrics?.vendor_revenue ?? 0)}
            </p>
            <p className="text-[11px] text-base-content/50">
              {metrics?.total_items_sold ?? 0} units sold
            </p>
          </div>
          <DollarSign className="pointer-events-none absolute -bottom-3 -right-3 w-16 h-16 text-success/10 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Search order #, customer, tracking number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered input-sm w-full pl-9 rounded-xl text-xs"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm rounded-xl text-xs font-medium min-w-[140px]"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="btn btn-primary btn-sm rounded-xl text-white font-bold px-4 text-xs"
            >
              Filter
            </button>
            {(search || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-ghost btn-sm rounded-xl text-xs font-medium text-base-content/60"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Orders Table Card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-base-300 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <span>Customer Orders List</span>
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Showing {orders.length} orders (Multi-Brand isolated fulfillment)
            </p>
          </div>

          <div className="badge badge-outline badge-sm text-[10px] font-semibold gap-1 text-base-content/60">
            <ShieldCheck className="w-3 h-3 text-success" />
            <span>Isolated Data Scope</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <span className="loading loading-spinner loading-md text-primary" />
            <p className="text-xs text-base-content/50">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-bold text-base text-base-content">No Orders Found</h4>
              <p className="text-xs text-base-content/60 leading-relaxed">
                {search || statusFilter !== 'all'
                  ? 'No orders match your filter criteria. Try clearing search filters.'
                  : 'No customer orders have been placed for your brand products yet.'}
              </p>
            </div>
            {(search || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-outline btn-sm rounded-xl text-xs font-bold"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-xs uppercase text-base-content/50 border-b border-base-300 bg-base-200/40">
                  <th className="py-3 px-4">Order # & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Brand Items</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tracking / Courier</th>
                  <th className="py-3 px-4 text-right">Brand Total</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200 text-xs">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-base-200/30 transition-colors">
                    {/* Order Number & Date */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-base-content text-sm">
                        {ord.order_number}
                      </div>
                      <div className="text-[11px] text-base-content/50 mt-0.5">
                        {formatDate(ord.created_at)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-base-content">
                        {ord.customer?.name || 'Customer'}
                      </div>
                      {ord.customer?.phone_number && (
                        <div className="text-[11px] text-base-content/60">
                          {ord.customer.phone_number}
                        </div>
                      )}
                      {ord.customer?.email && (
                        <div className="text-[10px] text-base-content/40 truncate max-w-[150px]">
                          {ord.customer.email}
                        </div>
                      )}
                    </td>

                    {/* Brand Items Thumbnails & Count */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden py-1">
                          {(ord.items || []).slice(0, 3).map((it, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-lg bg-base-200 border-2 border-base-100 overflow-hidden flex items-center justify-center shrink-0"
                            >
                              {it.featured_image ? (
                                <img
                                  src={it.featured_image}
                                  alt={it.product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <PackageCheck className="w-4 h-4 text-base-content/40" />
                              )}
                            </div>
                          ))}
                        </div>
                        <span className="badge badge-ghost badge-sm text-[10px] font-bold">
                          {ord.vendor_items_count} {ord.vendor_items_count === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(ord.status)}
                    </td>

                    {/* Courier & Tracking */}
                    <td className="py-3 px-4">
                      {ord.tracking_number ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-primary">
                            {ord.tracking_number}
                          </span>
                          {ord.courier_name && (
                            <div className="text-[10px] text-base-content/50">
                              {ord.courier_name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-base-content/40 italic">
                          Not assigned yet
                        </span>
                      )}
                    </td>

                    {/* Brand Subtotal */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-black text-sm text-base-content">
                        {formatCurrency(ord.vendor_subtotal)}
                      </div>
                      <div className="text-[10px] text-base-content/40">
                        Brand Subtotal
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewOrder(ord)}
                        className="btn btn-outline btn-xs rounded-lg gap-1 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-base-300 flex items-center justify-between">
            <span className="text-xs text-base-content/60">
              Page {page} of {totalPages} ({totalCount} orders total)
            </span>
            <div className="join">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="join-item btn btn-xs btn-outline"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="join-item btn btn-xs btn-outline"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl rounded-3xl p-6 relative border border-base-300">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-lg text-base-content">
                    Order {selectedOrder.order_number}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Placed on {formatDate(selectedOrder.created_at)}
                </p>
              </div>
            </div>

            {/* Multi-Brand Privacy Isolation Banner */}
            <div className="mt-4 p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-base-content">
                  Multi-Brand Split Order Isolation Active
                </p>
                <p className="text-base-content/70 leading-relaxed text-[11px]">
                  Paparan ini hanya menyenaraikan item dan hasil jualan milik jenama anda. Sekiranya pelanggan memesan produk jenama lain dalam checkout yang sama, item tersebut diasingkan secara automatik untuk melindungi kerahsiaan perniagaan vendor lain.
                </p>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {/* Customer Box */}
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/70 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Customer Details</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-base-content text-sm">
                    {selectedOrder.customer?.name || 'Customer'}
                  </p>
                  {selectedOrder.customer?.phone_number && (
                    <p className="text-base-content/70 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-base-content/40" />
                      <span>{selectedOrder.customer.phone_number}</span>
                    </p>
                  )}
                  {selectedOrder.customer?.email && (
                    <p className="text-base-content/70 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-base-content/40" />
                      <span>{selectedOrder.customer.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address Box */}
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/70 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Delivery Address</span>
                </div>
                {selectedOrder.shipping_address ? (
                  <div className="text-xs text-base-content/80 leading-relaxed">
                    <p className="font-bold text-base-content">
                      {selectedOrder.shipping_address.recipient_name}
                    </p>
                    <p>{selectedOrder.shipping_address.address_line1}</p>
                    {selectedOrder.shipping_address.address_line2 && (
                      <p>{selectedOrder.shipping_address.address_line2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_address.postcode} {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}
                    </p>
                    <p className="text-base-content/50 text-[11px]">{selectedOrder.shipping_address.country}</p>
                  </div>
                ) : (
                  <p className="text-xs text-base-content/50 italic">No shipping address recorded</p>
                )}
              </div>
            </div>

            {/* Tracking / Courier Row */}
            <div className="mt-4 p-3.5 rounded-2xl bg-base-200/40 border border-base-300 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span className="font-semibold text-base-content">Courier:</span>
                <span className="font-medium text-base-content/70">
                  {selectedOrder.courier_name || 'Standard Shipping'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base-content">Tracking No:</span>
                <span className="font-mono font-bold text-primary">
                  {selectedOrder.tracking_number || 'Awaiting Tracking'}
                </span>
              </div>
            </div>

            {/* Brand Items Table */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/70">
                  Your Brand Line Items ({selectedOrder.vendor_items_count} items)
                </h4>
              </div>

              <div className="border border-base-300 rounded-2xl overflow-hidden">
                <table className="table table-xs w-full">
                  <thead>
                    <tr className="bg-base-200/50 text-base-content/60 border-b border-base-300">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3 text-center">SKU / Variant</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {detailLoading ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-base-content/50">
                          <span className="loading loading-spinner loading-xs text-primary" />
                        </td>
                      </tr>
                    ) : (selectedOrder.items || []).map((item) => (
                      <tr key={item.id} className="hover:bg-base-200/20">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-base-200 overflow-hidden shrink-0 flex items-center justify-center border border-base-300">
                              {item.featured_image ? (
                                <img
                                  src={item.featured_image}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <PackageCheck className="w-4 h-4 text-base-content/40" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-base-content text-xs">
                                {item.product_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-[11px] text-base-content/60">
                          {item.variant_title || item.sku || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-xs">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-xs font-bold">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-xs font-black text-base-content">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-base-200/40 border-t border-base-300 text-xs">
                      <td colSpan={4} className="py-3 px-3 text-right font-bold text-base-content/70">
                        Brand Subtotal:
                      </td>
                      <td className="py-3 px-3 text-right font-black text-sm text-primary">
                        {formatCurrency(selectedOrder.vendor_subtotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-action pt-4 border-t border-base-300 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn btn-sm rounded-xl px-5"
              >
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedOrder(null)} />
        </div>
      )}
    </div>
  );
}
