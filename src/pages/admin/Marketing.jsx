import { useState } from 'react';
import {
  Megaphone, Mail, TrendingUp, Plus, Check, Copy,
  Trash2, Pause, Play,
} from '../../components/MaterialIcon';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusStyles = {
  active:  'bg-emerald-50 text-emerald-700 border border-emerald-100',
  paused:  'bg-amber-50  text-amber-700  border border-amber-100',
  expired: 'bg-red-50    text-red-600    border border-red-100',
  sent:    'bg-blue-50   text-blue-700   border border-blue-100',
};

const initialCodes = [
  { id: 1, code: 'WELCOME10', discount: 10, used: 284, limit: 500, expiry: '2025-12-31', status: 'active'  },
  { id: 2, code: 'KENTE25',   discount: 25, used: 156, limit: 200, expiry: '2025-06-30', status: 'active'  },
  { id: 3, code: 'SUMMER15',  discount: 15, used: 200, limit: 200, expiry: '2025-03-31', status: 'expired' },
  { id: 4, code: 'VIP30',     discount: 30, used: 42,  limit: 100, expiry: '2025-09-30', status: 'paused'  },
  { id: 5, code: 'ACCRA20',   discount: 20, used: 89,  limit: 300, expiry: '2025-12-31', status: 'active'  },
];

const campaigns = [
  { name: 'Welcome Series',          sent: '2025-01-10', recipients: 4280, openRate: '42.1%', clickRate: '8.3%',  status: 'active' },
  { name: 'New Arrivals Alert',      sent: '2025-01-05', recipients: 3940, openRate: '38.6%', clickRate: '11.2%', status: 'sent'   },
  { name: 'Kente Collection Launch', sent: '2024-12-20', recipients: 4100, openRate: '51.3%', clickRate: '15.8%', status: 'sent'   },
  { name: 'Holiday Sale',            sent: '2024-12-15', recipients: 4280, openRate: '45.7%', clickRate: '13.4%', status: 'sent'   },
];

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white bg-zinc-900 transition-all duration-300">
      <Check size={15} className="flex-shrink-0" />
      {toast}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Marketing() {
  const [codes, setCodes]         = useState(initialCodes);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ code: '', discount: '', expiry: '', maxUses: '' });
  const [copiedId, setCopiedId]   = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveCode = () => {
    if (!form.code.trim() || !form.discount) {
      showToast('Code name and discount % are required');
      return;
    }
    const newCode = {
      id:       Date.now(),
      code:     form.code.trim().toUpperCase(),
      discount: Number(form.discount),
      used:     0,
      limit:    Number(form.maxUses) || 999,
      expiry:   form.expiry || '—',
      status:   'active',
    };
    setCodes((prev) => [...prev, newCode]);
    setForm({ code: '', discount: '', expiry: '', maxUses: '' });
    setShowForm(false);
    showToast(`Discount code "${newCode.code}" created`);
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const toggleStatus = (id) => {
    setCodes((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
          : c
      )
    );
  };

  const handleDelete = (id) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));
    showToast('Discount code deleted');
  };

  // ── shared style strings ───────────────────────────────────────────────────
  const inputCls =
    'w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl ' +
    'focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100';

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">
      <Toast toast={toast} />

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-zinc-900">Marketing</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage campaigns, discount codes, and promotions</p>
      </div>

      {/* ── Overview stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Campaigns */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Megaphone size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Active Campaigns</p>
            <p className="text-2xl font-bold text-zinc-900 leading-tight">3</p>
          </div>
        </div>

        {/* Email Subscribers */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mail size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Email Subscribers</p>
            <p className="text-2xl font-bold text-zinc-900 leading-tight">4,280</p>
          </div>
        </div>

        {/* Avg Conversion Rate */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Avg Conversion Rate</p>
            <p className="text-2xl font-bold text-zinc-900 leading-tight">3.8%</p>
          </div>
        </div>
      </div>

      {/* ── Discount Codes ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-semibold text-zinc-900">Discount Codes</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Create Code
          </button>
        </div>

        {/* Inline create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-zinc-100 p-5">
            <h3 className="text-sm font-semibold text-zinc-800 mb-4">New Discount Code</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Code Name</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className={inputCls + ' font-mono uppercase'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Discount %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 20"
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiry}
                  onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">Max Uses</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={form.maxUses}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveCode}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
              >
                Save Code
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Codes table */}
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Code', 'Discount', 'Usage', 'Expiry', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {codes.map((c) => {
                  const pct = Math.min((c.used / c.limit) * 100, 100);
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Code (copyable) */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleCopy(c.code, c.id)}
                          className="flex items-center gap-2 group"
                          title="Copy to clipboard"
                        >
                          <span className="font-mono font-semibold text-zinc-900">{c.code}</span>
                          {copiedId === c.id ? (
                            <Check size={13} className="text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Copy size={13} className="text-zinc-300 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                          )}
                        </button>
                      </td>

                      {/* Discount */}
                      <td className="px-5 py-4 text-zinc-700">
                        <span className="font-semibold text-orange-500">{c.discount}%</span>{' '}off
                      </td>

                      {/* Usage + progress bar */}
                      <td className="px-5 py-4 min-w-[160px]">
                        <div className="space-y-1.5">
                          <span className="text-zinc-700">
                            {c.used.toLocaleString()} / {c.limit.toLocaleString()}
                          </span>
                          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-400 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4 text-zinc-600 tabular-nums">{c.expiry}</td>

                      {/* Status badge */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[c.status]}`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {c.status !== 'expired' && (
                            <button
                              onClick={() => toggleStatus(c.id)}
                              title={c.status === 'active' ? 'Pause' : 'Activate'}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                            >
                              {c.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Email Campaigns ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-semibold text-zinc-900">Email Campaigns</h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Plus size={15} />
            New Campaign
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Campaign Name', 'Sent Date', 'Recipients', 'Open Rate', 'Click Rate', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {campaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-zinc-900">{c.name}</td>
                    <td className="px-5 py-4 text-zinc-600 tabular-nums">{c.sent}</td>
                    <td className="px-5 py-4 text-zinc-700">{c.recipients.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-zinc-900">{c.openRate}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-orange-500">{c.clickRate}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
