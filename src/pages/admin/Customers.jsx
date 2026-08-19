import { useState, useEffect, useMemo } from 'react';
import { Search, MessageSquare, Users, ChevronLeft, ChevronRight, Loader2 } from '../../components/MaterialIcon';
import { customersApi } from '../../api/customers.js';
import SendMessageModal from '../../components/admin/SendMessageModal.jsx';

const ITEMS_PER_PAGE = 8;

const AVATAR_PALETTES = [
  { bg: 'bg-orange-100',  text: 'text-orange-600'  },
  { bg: 'bg-blue-100',    text: 'text-blue-600'    },
  { bg: 'bg-purple-100',  text: 'text-purple-600'  },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
];

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [messageTargets, setMessageTargets] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [list, s] = await Promise.all([customersApi.list(), customersApi.stats()]);
        if (!cancelled) {
          setCustomers(list);
          setStats(s);
        }
      } catch {
        if (!cancelled) setCustomers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, statusFilter]);

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'All' || c.status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filteredCustomers.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const allPageSelected =
    paginated.length > 0 && paginated.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginated.find((c) => c.id === id)));
    } else {
      const newIds = paginated.map((c) => c.id);
      setSelectedIds((prev) => [...new Set([...prev, ...newIds])]);
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const goToPage = (n) => setCurrentPage(Math.max(1, Math.min(n, totalPages)));

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, safePage - 1);
    const end   = Math.min(totalPages, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const openMessage = (targets) => setMessageTargets(targets);

  const statPills = [
    { label: 'Total Customers', value: stats.total, color: 'text-zinc-900' },
    { label: 'Active', value: stats.active, color: 'text-emerald-600' },
    { label: 'New This Month', value: stats.newThisMonth, color: 'text-orange-500' },
  ];

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900">Customers</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {loading ? 'Loading…' : `${stats.total} registered customer${stats.total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.length > 0 && (
            <button
              onClick={() => openMessage(customers.filter((c) => selectedIds.includes(c.id)))}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
            >
              <MessageSquare size={14} />
              Text Selected ({selectedIds.length})
            </button>
          )}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 w-52"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 text-zinc-600"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Stat pills */}
      <div className="flex items-center gap-3 flex-wrap">
        {statPills.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 bg-white border border-zinc-100 rounded-xl px-4 py-2 text-sm"
          >
            <span className="text-zinc-500">{s.label}:</span>
            <span className={`font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading customers…</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/50">
                    <th className="w-10 px-5 py-3">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-orange-500 cursor-pointer rounded"
                      />
                    </th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 min-w-[220px]">
                      Customer
                    </th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">
                      Location
                    </th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">
                      Phone
                    </th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">
                      Orders
                    </th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">
                      Total Spent
                    </th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 hidden xl:table-cell">
                      Joined
                    </th>
                    <th className="text-right text-xs font-semibold text-zinc-400 uppercase tracking-wide px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16">
                        <Users size={32} className="text-zinc-200 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm font-medium">No customers found</p>
                        <p className="text-zinc-300 text-xs mt-1">
                          {customers.length === 0
                            ? 'Customers will appear here when they register'
                            : 'Try adjusting your search or filter'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((customer, idx) => {
                      const palette = AVATAR_PALETTES[(customer.id - 1) % AVATAR_PALETTES.length];
                      const isSelected = selectedIds.includes(customer.id);
                      return (
                        <tr
                          key={customer.id}
                          className={`hover:bg-zinc-50/50 transition-colors ${
                            idx < paginated.length - 1 ? 'border-b border-zinc-50' : ''
                          } ${isSelected ? 'bg-orange-50/30' : ''}`}
                        >
                          <td className="px-5 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(customer.id)}
                              className="w-4 h-4 accent-orange-500 cursor-pointer rounded"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 ${palette.bg} ${palette.text} rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 select-none`}
                              >
                                {getInitials(customer.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-900 truncate max-w-[160px] text-sm leading-tight">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-zinc-400 truncate max-w-[160px] mt-0.5">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden lg:table-cell">
                            <span className="text-sm text-zinc-600 whitespace-nowrap">
                              {customer.location}
                            </span>
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <span className="text-sm text-zinc-600">
                              {customer.phone || '—'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-semibold text-zinc-900">{customer.orders}</span>
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <span className="font-bold text-zinc-900">
                              ${Math.round(customer.totalSpent).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {customer.status === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-500 border border-zinc-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 hidden xl:table-cell">
                            <span className="text-xs text-zinc-400">{formatDate(customer.joined)}</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openMessage([customer])}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                title="Send text message"
                              >
                                <MessageSquare size={15} />
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-50">
                <p className="text-xs text-zinc-400">
                  Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(safePage * ITEMS_PER_PAGE, filteredCustomers.length)} of{' '}
                  {filteredCustomers.length} customers
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
            )}
          </>
        )}
      </div>

      {messageTargets && (
        <SendMessageModal
          customers={messageTargets}
          onClose={() => setMessageTargets(null)}
        />
      )}
    </div>
  );
}
