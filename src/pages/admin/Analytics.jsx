import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, BarChart3, ArrowUpRight } from '../../components/MaterialIcon';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { productsApi } from '../../api/products.js';
import { ordersApi } from '../../api/orders.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DATE_TABS = ['7D', '30D', '3M', '12M'];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PIE_COLORS = ['#f97316', '#18181b', '#fb923c', '#a1a1aa'];

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-zinc-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-zinc-900">
        ${payload[0].value.toLocaleString()}
      </p>
      {payload[0].payload.orders > 0 && (
        <p className="text-xs text-zinc-400 mt-0.5">
          {payload[0].payload.orders} orders
        </p>
      )}
    </div>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-zinc-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-zinc-900">{payload[0].value} orders</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-lg">
      <p className="text-xs font-semibold text-zinc-600">{payload[0].name}</p>
      <p className="text-sm font-bold text-zinc-900">{payload[0].value} products</p>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('12M');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    monthly: [],
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ordersApi.stats(), productsApi.list()])
      .then(([s, p]) => { setStats(s); setProducts(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────

  const chartData = MONTH_NAMES.map((name, i) => {
    const monthNum = String(i + 1).padStart(2, '0');
    const found = stats.monthly.find(m => m.month === monthNum);
    return { month: name, revenue: found?.revenue ?? 0, orders: found?.orders ?? 0 };
  });

  const avgOrderValue =
    stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0;

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Products Listed',
      value: products.length.toLocaleString(),
      icon: BarChart3,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Avg Order Value',
      value: `$${avgOrderValue.toLocaleString()}`,
      icon: Users,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
  ];

  const catCounts = ['Clothing', 'Bags', 'Jewelry', 'Accessories'].map(cat => ({
    name: cat,
    value: products.filter(p => p.category === cat).length,
  })).filter(c => c.value > 0);
  const pieData = catCounts.length > 0 ? catCounts : [{ name: 'No products', value: 1 }];

  const topProducts = [...products]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);

  // ── Loading spinner ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-9 h-9 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900">Analytics</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Track your store's performance</p>
        </div>
        {/* Date range pill tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 self-start sm:self-auto">
          {DATE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">{card.value}</p>
            <p className="text-sm text-zinc-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Empty state banner ── */}
      {stats.totalOrders === 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 text-center">
          <p className="font-semibold text-orange-700">No orders yet</p>
          <p className="text-sm text-orange-500 mt-1">Charts will populate as customers place orders.</p>
        </div>
      )}

      {/* ── Revenue Over Time (full width) ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">
              Revenue Overview
            </p>
            <p className="text-lg font-bold text-zinc-900">Monthly Revenue & Orders</p>
            {stats.totalRevenue > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">
                  ${stats.totalRevenue.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400">· total revenue</span>
              </div>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-zinc-500 self-start mt-1">
            <span className="w-3 h-0.5 bg-orange-500 inline-block rounded-full" />
            Revenue
          </span>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₵${(v / 1000).toFixed(1)}k`}
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<AreaTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={2.5}
              fill="url(#analyticsAreaGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Two charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Monthly Orders BarChart */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-zinc-900">Monthly Orders</p>
            <p className="text-xs text-zinc-400 mt-0.5">Order volume across the year</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: '#f4f4f5' }} />
              <Bar
                dataKey="orders"
                fill="#f97316"
                radius={[5, 5, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Category PieChart */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-zinc-900">Products by Category</p>
            <p className="text-xs text-zinc-400 mt-0.5">Distribution of listed products</p>
          </div>

          {/* Pie centred in the card */}
          <div className="flex justify-center">
            <ResponsiveContainer width={200} height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend below */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-3">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-xs text-zinc-600 flex-1 truncate">{item.name}</span>
                {catCounts.length > 0 && (
                  <span className="text-xs font-bold text-zinc-900">{item.value}</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-50">
            <p className="text-xs text-zinc-400">
              Based on{' '}
              <span className="font-semibold text-zinc-700">{products.length.toLocaleString()}</span>{' '}
              listed products
            </p>
          </div>
        </div>
      </div>

      {/* ── Top Performing Products Table ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Top Performing Products</p>
            <p className="text-xs text-zinc-400 mt-0.5">Ranked by number of reviews</p>
          </div>
          <button className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-5 py-3 w-16">
                  Rank
                </th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3 min-w-[200px]">
                  Product
                </th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">
                  Revenue
                </th>
                <th className="text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide px-3 py-3">
                  Reviews
                </th>
                <th className="text-right text-xs font-semibold text-zinc-400 uppercase tracking-wide px-5 py-3">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-zinc-400">
                    No products yet
                  </td>
                </tr>
              ) : (
                topProducts.map((product, idx) => {
                  const revenue = Math.round(product.price * product.reviews);
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-zinc-50/50 transition-colors ${
                        idx < topProducts.length - 1 ? 'border-b border-zinc-50' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            idx === 0
                              ? 'bg-orange-500 text-white'
                              : idx === 1
                              ? 'bg-zinc-900 text-white'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://picsum.photos/seed/p${product.id}/40/40`;
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 truncate max-w-[180px] text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-zinc-400">{product.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="px-3 py-3.5">
                        <span className="font-bold text-zinc-900">
                          ${revenue.toLocaleString()}
                        </span>
                      </td>

                      {/* Reviews */}
                      <td className="px-3 py-3.5">
                        <span className="text-zinc-700 font-medium">{product.reviews}</span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <ArrowUpRight size={11} />
                          ${product.price.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
