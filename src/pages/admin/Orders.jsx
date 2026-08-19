import { useState, useMemo, useEffect } from 'react';
import {
  Search, Eye, RefreshCw, Download,
  ChevronLeft, ChevronRight, ShoppingBag,
  Clock, Package, CheckCircle2,
} from '../../components/MaterialIcon';
import { ordersApi } from '../../api/orders.js';

// ─── Constants ─────────────────────────────────────────────────────────────────

const ORDERS_PER_PAGE = 10;

const STATUS_CYCLE = ['pending', 'processing', 'shipped', 'delivered'];

const statusConfig = {
  pending: {
    label: 'Pending',
    classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dot: 'bg-yellow-400',
  },
  processing: {
    label: 'Processing',
    classes: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  shipped: {
    label: 'Shipped',
    classes: 'bg-purple-50 text-purple-700 border border-purple-200',
    dot: 'bg-purple-500',
  },
  delivered: {
    label: 'Delivered',
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <p className="text-xl font-bold text-zinc-900">{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch on mount ───────────────────────────────────────────────────────────

  useEffect(() => {
    ordersApi.list()
      .then(data => setOrders(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase();
    let list = orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const displayId = o.order_ref ? `#${o.order_ref}` : `#ORD-${o.id}`;
      const matchesSearch =
        !q ||
        displayId.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });

    if (sortOrder === 'newest') list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortOrder === 'oldest') list = [...list].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sortOrder === 'amount-desc') list = [...list].sort((a, b) => b.total - a.total);
    else if (sortOrder === 'amount-asc') list = [...list].sort((a, b) => a.total - b.total);

    return list;
  }, [orders, search, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * ORDERS_PER_PAGE,
    safePage * ORDERS_PER_PAGE,
  );

  const allPageSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selectedIds.includes(o.id));

  // ── Actions ──────────────────────────────────────────────────────────────────

  const cycleStatus = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const idx = STATUS_CYCLE.indexOf(order.status);
    const newStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    ordersApi.updateStatus(orderId, newStatus)
      .then(() => {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
      })
      .catch((e) => {
        console.error('Failed to update order status:', e.message);
      });
  };

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedOrders.find((o) => o.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedOrders.map((o) => o.id)])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const goToPage = (n) => setCurrentPage(Math.max(1, Math.min(n, totalPages)));

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, safePage - 1);
    const end = Math.min(totalPages, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // ── Stats summary ────────────────────────────────────────────────────────────

  const orderStats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }), [orders]);

  // ── Loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <svg className="animate-spin w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-6 max-w-screen-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
          <p className="text-red-500 font-semibold text-sm">Failed to load orders</p>
          <p className="text-zinc-400 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // ── Empty state (no orders in store yet) ────────────────────────────────────

  if (orders.length === 0) {
    return (
      <div className="p-6 max-w-screen-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900">Orders</h1>
          <p className="text-sm text-zinc-400 mt-0.5">0 total orders this year</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center">
            <ShoppingBag size={26} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-zinc-700 font-semibold text-base">No orders yet</p>
            <p className="text-zinc-400 text-sm mt-1">Orders from your store will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900">Orders</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{orders.length} total orders this year</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-600 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
            <option>Jan 2025 — Dec 2025</option>
            <option>Jan 2024 — Dec 2024</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm">
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={ShoppingBag}  iconBg="bg-zinc-100"    iconColor="text-zinc-600"    label="Total Orders"  value={orderStats.total.toLocaleString()} />
        <StatCard icon={Clock}        iconBg="bg-yellow-50"   iconColor="text-yellow-600"  label="Pending"       value={orderStats.pending} />
        <StatCard icon={Package}      iconBg="bg-blue-50"     iconColor="text-blue-600"    label="Processing"    value={orderStats.processing} />
        <StatCard icon={CheckCircle2} iconBg="bg-emerald-50"  iconColor="text-emerald-600" label="Delivered"     value={orderStats.delivered} />
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-600 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-600 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </select>

        <p className="text-sm text-zinc-400 ml-auto sm:ml-0 hidden sm:block whitespace-nowrap">
          {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Orders table ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="w-10 px-5 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                </th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">Order ID</th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Items</th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">Date</th>
                <th className="text-right text-xs font-semibold text-zinc-400 uppercase tracking-wide px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <ShoppingBag size={32} className="text-zinc-200 mx-auto mb-3" />
                    <p className="text-zinc-400 text-sm font-medium">No orders found</p>
                    <p className="text-zinc-300 text-xs mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, idx) => {
                  const cfg = statusConfig[order.status] ?? statusConfig.pending;
                  const displayId = order.order_ref ? `#${order.order_ref}` : `#ORD-${order.id}`;
                  const itemLabel = `${order.item_count} item${order.item_count !== 1 ? 's' : ''}`;
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-zinc-50/50 transition-colors ${
                        idx < paginatedOrders.length - 1 ? 'border-b border-zinc-50' : ''
                      } ${selectedIds.includes(order.id) ? 'bg-orange-50/30' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={() => toggleSelect(order.id)}
                          className="w-4 h-4 accent-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="px-3 py-3.5">
                        <span className="font-mono text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg whitespace-nowrap">
                          {displayId}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {order.customer_name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-zinc-900 whitespace-nowrap text-sm">
                            {order.customer_name}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-3 py-3.5 hidden md:table-cell">
                        <span className="text-zinc-600 text-sm">{itemLabel}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-3.5">
                        <span className="font-bold text-zinc-900">${order.total.toLocaleString()}</span>
                      </td>

                      {/* Status — click to cycle */}
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => cycleStatus(order.id)}
                          title="Click to advance status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer transition-opacity hover:opacity-80 ${cfg.classes}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-zinc-400">{formatDate(order.created_at)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="View order"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => cycleStatus(order.id)}
                            title="Advance status"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                          >
                            <RefreshCw size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-50">
          <p className="text-xs text-zinc-400">
            Showing{' '}
            <span className="font-semibold text-zinc-600">
              {filteredOrders.length === 0 ? 0 : (safePage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(safePage * ORDERS_PER_PAGE, filteredOrders.length)}
            </span>{' '}
            of <span className="font-semibold text-zinc-600">{filteredOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {pageNumbers().map((n) => (
              <button
                key={n}
                onClick={() => goToPage(n)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  n === safePage
                    ? 'bg-orange-500 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
