import { useState, useEffect } from 'react';
import { Download, Filter, TrendingUp, ShoppingCart, Users, Package, Eye, ArrowUpRight } from '../../components/MaterialIcon';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { salesData } from '../../data/products';
import { productsApi } from '../../api/products.js';
import { ordersApi } from '../../api/orders.js';

// ─── Stat Cards ──────────────────────────────────────────────────────────────

// statsCards is now built dynamically inside the component using live data

// ─── Category pie data ────────────────────────────────────────────────────────

const categoryData = [
  { name: 'Clothing', value: 45 },
  { name: 'Bags', value: 28 },
  { name: 'Jewelry', value: 17 },
  { name: 'Accessories', value: 10 },
];

const PIE_COLORS = ['#f97316', '#18181b', '#fb923c', '#a1a1aa'];

// ─── Custom recharts tooltips ─────────────────────────────────────────────────

const AreaTooltipContent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-zinc-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-zinc-900">
          ${payload[0].value.toLocaleString()}
        </p>
        {payload[0].payload.orders && (
          <p className="text-xs text-zinc-400 mt-0.5">
            {payload[0].payload.orders} orders
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PieTooltipContent = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-zinc-600">{payload[0].name}</p>
        <p className="text-sm font-bold text-zinc-900">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

// ─── Status badge helper ──────────────────────────────────────────────────────

const statusStyles = {
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  processing: 'bg-orange-50 text-orange-700 border border-orange-200',
  shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
  pending: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [liveStats, setLiveStats] = useState({ totalRevenue: 0, totalOrders: 0, pendingOrders: 0 });
  const [productCount, setProductCount] = useState(0);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    productsApi.list().then((data) => {
      setProductCount(data.length);
      setTopProducts([...data].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0)).slice(0, 5));
    }).catch(() => {});
    ordersApi.stats().then(setLiveStats).catch(() => {});
    ordersApi.list().then((data) => setDisplayOrders(data.slice(0, 6))).catch(() => {});
  }, []);

  const maxReviews = topProducts[0]?.reviews ?? 1;

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Jan 2025 — Dec 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Filter size={15} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm">
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',  value: `$${liveStats.totalRevenue.toLocaleString()}`, trend: null,     icon: Eye,          iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
          { label: 'Total Orders',   value: liveStats.totalOrders.toLocaleString(),               trend: null,     icon: ShoppingCart, iconBg: 'bg-blue-50',   iconColor: 'text-blue-500'   },
          { label: 'Pending Orders', value: liveStats.pendingOrders.toLocaleString(),              trend: null,     icon: Users,        iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
          { label: 'Products',       value: productCount.toLocaleString(),                         trend: null,     icon: Package,      iconBg: 'bg-zinc-100',  iconColor: 'text-zinc-500'   },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              {card.trend ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <ArrowUpRight size={11} />
                  {card.trend}
                </span>
              ) : (
                <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full">—</span>
              )}
            </div>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight">{card.value}</p>
            <p className="text-sm text-zinc-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main row: chart + top products ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Sales Overview */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Sales Overview</p>
              <p className="text-2xl font-bold text-zinc-900">$47,250</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">+15.8%</span>
                <span className="text-xs text-zinc-400">· +$6,300 increased vs last year</span>
              </div>
            </div>
            <select className="text-xs border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-500 focus:outline-none focus:border-orange-300 bg-white self-start">
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
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
              <Tooltip content={<AreaTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-zinc-900">Top Products</p>
            <button className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={product.id}>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-zinc-300 w-4 mt-0.5 flex-shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900 truncate leading-tight">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-zinc-900 flex-shrink-0">
                        ${product.price}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">{product.category}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${(product.reviews / maxReviews) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 flex-shrink-0">{product.reviews}</span>
                    </div>
                  </div>
                </div>
                {idx < topProducts.length - 1 && (
                  <div className="border-b border-zinc-50 mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: recent orders + pie chart ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
            <p className="text-sm font-semibold text-zinc-900">Recent Orders</p>
            <button className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-50">
                  <th className="text-left text-xs font-semibold text-zinc-400 px-5 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 px-3 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 px-3 py-3 hidden sm:table-cell">Amount</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-zinc-400 px-5 py-3 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-zinc-400 text-sm py-10">No orders yet</td></tr>
                ) : displayOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-zinc-50/50 transition-colors ${idx < displayOrders.length - 1 ? 'border-b border-zinc-50' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-semibold text-orange-500">
                        {order.order_ref ? `#${order.order_ref}` : `#ORD-${order.id}`}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium text-zinc-900 whitespace-nowrap">{order.customer_name}</span>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <span className="text-xs font-semibold text-zinc-900">${order.total}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-xs text-zinc-400">{formatDate(order.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-zinc-900">Sales by Category</p>
            <span className="text-xs text-zinc-400">Jan — Dec 2025</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto">
              <ResponsiveContainer width={220} height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-3 w-full">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-700">{item.name}</span>
                      <span className="text-xs font-bold text-zinc-900">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: PIE_COLORS[index],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-zinc-50 mt-2">
                <p className="text-xs text-zinc-400">
                  Based on <span className="font-semibold text-zinc-700">1,183</span> total orders
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
