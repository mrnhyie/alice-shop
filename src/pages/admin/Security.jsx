import { useState } from 'react';
import { Eye, EyeOff, Check, Monitor, Smartphone, Tablet, Shield } from '../../components/MaterialIcon';

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
        toast.type === 'error' ? 'bg-red-500' : 'bg-zinc-900'
      }`}
    >
      <Check size={15} className="flex-shrink-0" />
      {toast.message}
    </div>
  );
}

// ─── Password field with show / hide ──────────────────────────────────────────

function PasswordField({ label, value, onChange, show, onToggle }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 pr-10 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Password strength indicator (4 dots) ─────────────────────────────────────

function PasswordStrength({ password }) {
  // each dot lights up at length ≥ 6, 8, 10, 12
  const thresholds = [6, 8, 10, 12];
  const strength   = thresholds.filter((n) => password.length >= n).length;
  const labels     = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {thresholds.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? 'bg-orange-500' : 'bg-zinc-100'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength === 4 ? 'text-emerald-500'
        : strength >= 2 ? 'text-orange-500'
        : 'text-red-500'
      }`}>
        {labels[strength]}
      </p>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
        checked ? 'bg-orange-500' : 'bg-zinc-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Device icon helper ───────────────────────────────────────────────────────

function DeviceIcon({ device, size = 15 }) {
  const d = device.toLowerCase();
  if (d.includes('iphone'))  return <Smartphone size={size} className="text-zinc-400" />;
  if (d.includes('ipad'))    return <Tablet     size={size} className="text-zinc-400" />;
  return                            <Monitor    size={size} className="text-zinc-400" />;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const loginActivity = [
  { device: 'MacBook Pro', browser: 'Chrome 121',  ip: '197.x.x.x', location: 'Accra, Ghana',  date: '2025-01-15 14:32', status: 'success' },
  { device: 'iPhone 15',   browser: 'Safari 17',   ip: '41.x.x.x',  location: 'Accra, Ghana',  date: '2025-01-14 09:18', status: 'success' },
  { device: 'Windows PC',  browser: 'Firefox 122', ip: '102.x.x.x', location: 'Lagos, Nigeria', date: '2025-01-12 22:05', status: 'failed'  },
  { device: 'iPad Pro',    browser: 'Chrome 121',  ip: '197.x.x.x', location: 'Accra, Ghana',  date: '2025-01-10 16:44', status: 'success' },
  { device: 'MacBook Pro', browser: 'Chrome 120',  ip: '197.x.x.x', location: 'Accra, Ghana',  date: '2025-01-08 11:22', status: 'success' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Security() {
  const [toast, setToast] = useState(null);

  // ── Change Password ────────────────────────────────────────────────────────
  const [current,     setCurrent]     = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Two-Factor Auth ────────────────────────────────────────────────────────
  const [twoFA, setTwoFA] = useState(false);

  // ── Active Sessions ────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([
    {
      id:       'mobile',
      device:   'iPhone 15',
      browser:  'Safari',
      location: 'Accra, Ghana',
      started:  '1 day ago',
    },
  ]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Password update ────────────────────────────────────────────────────────
  const handleUpdatePassword = () => {
    if (!current.trim()) {
      showToast('Current password is required', 'error');
      return;
    }
    if (newPass.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPass !== confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setCurrent('');
    setNewPass('');
    setConfirm('');
    showToast('Password updated successfully');
  };

  const revokeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast('Session revoked');
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">
      <Toast toast={toast} />

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-zinc-900">Security</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your account security and active access sessions</p>
      </div>

      {/* ── Change Password ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-zinc-900">Change Password</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Update your admin account password</p>
        </div>

        <div className="max-w-md space-y-4">
          <PasswordField
            label="Current Password"
            value={current}
            onChange={setCurrent}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
          />

          <div className="space-y-2">
            <PasswordField
              label="New Password"
              value={newPass}
              onChange={setNewPass}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
            {newPass.length > 0 && <PasswordStrength password={newPass} />}
          </div>

          <PasswordField
            label="Confirm New Password"
            value={confirm}
            onChange={setConfirm}
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
          />

          <button
            onClick={handleUpdatePassword}
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* ── Recent Login Activity ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-900">Recent Login Activity</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Review recent sign-in attempts to your admin account</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Device', 'Browser', 'IP Address', 'Location', 'Date & Time', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide px-5 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loginActivity.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <DeviceIcon device={row.device} />
                      <span className="font-medium text-zinc-900">{row.device}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">{row.browser}</td>
                  <td className="px-5 py-4 font-mono text-xs text-zinc-500">{row.ip}</td>
                  <td className="px-5 py-4 text-zinc-600">{row.location}</td>
                  <td className="px-5 py-4 text-zinc-600 tabular-nums">{row.date}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      row.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-red-50    text-red-600    border border-red-100'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Two-Factor Authentication ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-zinc-900">Two-Factor Authentication</h2>
            <p className="text-sm text-zinc-500 mt-0.5 max-w-lg">
              Add an extra layer of security to your admin account. Once enabled,
              you'll need your phone to sign in.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <Toggle checked={twoFA} onChange={setTwoFA} />
              <span className="text-sm font-medium text-zinc-700">Enable 2FA</span>
            </div>

            {twoFA && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-sm text-orange-700 leading-relaxed">
                  2FA setup would be completed here via authenticator app in production.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Active Sessions ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-zinc-900">Active Sessions</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Devices currently signed in to your admin account</p>
        </div>

        <div className="space-y-3">
          {/* Current device — always shown, no revoke */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg border border-zinc-200 flex items-center justify-center flex-shrink-0">
                <Monitor size={16} className="text-zinc-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-zinc-900">MacBook Pro · Chrome</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                    Current
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">Accra, Ghana · Started 2 hours ago</p>
              </div>
            </div>
            <span className="hidden sm:block text-xs font-medium text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-lg flex-shrink-0">
              This Device
            </span>
          </div>

          {/* Revokable sessions */}
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center flex-shrink-0">
                  <DeviceIcon device={s.device} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{s.device} · {s.browser}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{s.location} · Started {s.started}</p>
                </div>
              </div>
              <button
                onClick={() => revokeSession(s.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Revoke
              </button>
            </div>
          ))}

          {sessions.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-6">No other active sessions</p>
          )}
        </div>
      </div>
    </div>
  );
}
