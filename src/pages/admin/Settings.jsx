import { useEffect, useState } from 'react';
import { Check, Plus, Trash2 } from '../../components/MaterialIcon';
import { announcementsApi } from '../../api/announcements';

// ─── Shared sub-components ────────────────────────────────────────────────────

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white bg-zinc-900 transition-all duration-300">
      <Check size={15} className="flex-shrink-0" />
      {message}
    </div>
  );
}

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

// ─── Shared style strings ─────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl ' +
  'focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100';

const saveBtnCls =
  'px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold ' +
  'hover:bg-orange-600 transition-colors shadow-sm';

function SectionCard({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6">
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Currency prefix input ────────────────────────────────────────────────────

function PrefixInput({ label, prefix, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1.5">{label}</label>
      <div className="flex">
        <span className="px-3 py-2.5 text-sm bg-zinc-50 border border-r-0 border-zinc-200 rounded-l-xl text-zinc-500 font-medium select-none">
          {prefix}
        </span>
        <input
          type="number"
          value={value}
          onChange={onChange}
          className="flex-1 px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-r-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Settings() {
  const [toastMsg, setToastMsg] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementError, setAnnouncementError] = useState('');
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  // ── Store Information ──────────────────────────────────────────────────────
  const [store, setStore] = useState({
    name:    'Alice',
    tagline: 'Carry Culture With You',
    email:   'aliceasimenu106@gmail.com',
    phone:   '+1 (216) 313-0231',
    address: '3355 Richmond Rd, Beachwood, OH 44122, USA',
  });

  // ── Shipping ───────────────────────────────────────────────────────────────
  const [shipping, setShipping] = useState({
    freeThreshold:    500,
    standardRate:     30,
    expressRate:      80,
    standardDelivery: '5–7 Business Days',
    expressDelivery:  '2–3 Business Days',
  });

  // ── Regional ───────────────────────────────────────────────────────────────
  const [regional, setRegional] = useState({
    currency:   'USD',
    language:   'English',
    timezone:   'America/New_York',
    dateFormat: 'DD/MM/YYYY',
  });

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    newOrder:     true,
    lowStock:     true,
    signups:      false,
    weeklyReport: true,
  });

  // ── Danger zone ────────────────────────────────────────────────────────────
  const [pendingClear, setPendingClear] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadAnnouncements = async () => {
    try {
      setAnnouncements(await announcementsApi.list());
    } catch {
      setAnnouncementError('Could not load announcements. Ensure the API is running.');
    }
  };

  useEffect(() => { loadAnnouncements(); }, []);

  const addAnnouncement = async (event) => {
    event.preventDefault();
    const text = announcementText.trim();
    if (!text) return;
    setAnnouncementSaving(true);
    setAnnouncementError('');
    try {
      const created = await announcementsApi.create(text);
      setAnnouncements((items) => [created, ...items]);
      setAnnouncementText('');
      showToast('Announcement published');
    } catch (error) {
      setAnnouncementError(error.message || 'Could not publish the announcement.');
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const removeAnnouncement = async (id) => {
    setAnnouncementError('');
    try {
      await announcementsApi.delete(id);
      setAnnouncements((items) => items.filter((item) => item.id !== id));
      showToast('Announcement removed');
    } catch (error) {
      setAnnouncementError(error.message || 'Could not remove the announcement.');
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">
      <Toast message={toastMsg} />

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Configure your store preferences and account settings</p>
      </div>

      <SectionCard>
        <CardHeader
          title="Site Announcements"
          subtitle="Add notices that appear across the storefront. Remove a notice to take it down immediately."
        />
        <form onSubmit={addAnnouncement} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            maxLength={180}
            value={announcementText}
            onChange={(event) => setAnnouncementText(event.target.value)}
            placeholder="e.g. Free delivery in Accra this weekend"
            className={inputCls}
          />
          <button type="submit" disabled={announcementSaving || !announcementText.trim()} className={`${saveBtnCls} inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60`}>
            <Plus size={16} /> {announcementSaving ? 'Publishing…' : 'Add announcement'}
          </button>
        </form>
        {announcementError && <p className="mt-3 text-sm text-red-600">{announcementError}</p>}
        <div className="mt-4 space-y-2">
          {announcements.length === 0 ? (
            <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">No announcements are currently shown.</p>
          ) : announcements.map((announcement) => (
            <div key={announcement.id} className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
              <p className="text-sm text-zinc-700">{announcement.text}</p>
              <button
                type="button"
                onClick={() => removeAnnouncement(announcement.id)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove announcement: ${announcement.text}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Card 1: Store Information ────────────────────────────────────────── */}
      <SectionCard>
        <CardHeader
          title="Store Information"
          subtitle="Manage your store details and contact information"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Store Name</label>
            <input
              type="text"
              value={store.name}
              onChange={(e) => setStore((s) => ({ ...s, name: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Tagline</label>
            <input
              type="text"
              value={store.tagline}
              onChange={(e) => setStore((s) => ({ ...s, tagline: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Support Email</label>
            <input
              type="email"
              value={store.email}
              onChange={(e) => setStore((s) => ({ ...s, email: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Phone</label>
            <input
              type="text"
              value={store.phone}
              onChange={(e) => setStore((s) => ({ ...s, phone: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Address</label>
            <textarea
              rows={3}
              value={store.address}
              onChange={(e) => setStore((s) => ({ ...s, address: e.target.value }))}
              className={inputCls + ' resize-none'}
            />
          </div>
        </div>
        <div className="mt-5">
          <button onClick={() => showToast('Store information updated')} className={saveBtnCls}>
            Save Changes
          </button>
        </div>
      </SectionCard>

      {/* ── Card 2: Shipping Configuration ──────────────────────────────────── */}
      <SectionCard>
        <CardHeader
          title="Shipping Configuration"
          subtitle="Set shipping rates and delivery estimates for your customers"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PrefixInput
            label="Free Shipping Threshold"
            prefix="$"
            value={shipping.freeThreshold}
            onChange={(e) => setShipping((s) => ({ ...s, freeThreshold: e.target.value }))}
          />
          <PrefixInput
            label="Standard Shipping Rate"
            prefix="$"
            value={shipping.standardRate}
            onChange={(e) => setShipping((s) => ({ ...s, standardRate: e.target.value }))}
          />
          <PrefixInput
            label="Express Shipping Rate"
            prefix="$"
            value={shipping.expressRate}
            onChange={(e) => setShipping((s) => ({ ...s, expressRate: e.target.value }))}
          />
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Estimated Standard Delivery</label>
            <input
              type="text"
              value={shipping.standardDelivery}
              onChange={(e) => setShipping((s) => ({ ...s, standardDelivery: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Estimated Express Delivery</label>
            <input
              type="text"
              value={shipping.expressDelivery}
              onChange={(e) => setShipping((s) => ({ ...s, expressDelivery: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
        <div className="mt-5">
          <button onClick={() => showToast('Shipping configuration saved')} className={saveBtnCls}>
            Save Changes
          </button>
        </div>
      </SectionCard>

      {/* ── Card 3: Regional Settings ────────────────────────────────────────── */}
      <SectionCard>
        <CardHeader
          title="Regional Settings"
          subtitle="Configure currency, language and time preferences"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Currency</label>
            <select
              value={regional.currency}
              onChange={(e) => setRegional((r) => ({ ...r, currency: e.target.value }))}
              className={inputCls}
            >
              <option value="USD">$ US Dollar</option>
              <option value="GHS">GH₵ Ghanaian Cedi</option>
              <option value="GBP">£ British Pound</option>
              <option value="EUR">€ Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Language</label>
            <select
              value={regional.language}
              onChange={(e) => setRegional((r) => ({ ...r, language: e.target.value }))}
              className={inputCls}
            >
              <option>English</option>
              <option>French</option>
              <option>Twi</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Timezone</label>
            <select
              value={regional.timezone}
              onChange={(e) => setRegional((r) => ({ ...r, timezone: e.target.value }))}
              className={inputCls}
            >
              <option value="America/New_York">America/New_York (ET)</option>
              <option value="Africa/Accra">Africa/Accra (GMT+0)</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5">Date Format</label>
            <select
              value={regional.dateFormat}
              onChange={(e) => setRegional((r) => ({ ...r, dateFormat: e.target.value }))}
              className={inputCls}
            >
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        <div className="mt-5">
          <button onClick={() => showToast('Regional settings saved')} className={saveBtnCls}>
            Save Changes
          </button>
        </div>
      </SectionCard>

      {/* ── Card 4: Notifications ────────────────────────────────────────────── */}
      <SectionCard>
        <CardHeader
          title="Notification Preferences"
          subtitle="Choose which alerts and updates you want to receive"
        />
        <div className="divide-y divide-zinc-50">
          {[
            { key: 'newOrder',     label: 'New Order Alerts',    desc: 'Get notified when a new order is placed' },
            { key: 'lowStock',     label: 'Low Stock Warnings',  desc: 'Alert when product stock falls below 5 units' },
            { key: 'signups',      label: 'Customer Sign-ups',   desc: 'Notify on new customer registrations' },
            { key: 'weeklyReport', label: 'Weekly Sales Report', desc: 'Receive a weekly performance email every Monday' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex-1 pr-6">
                <p className="text-sm font-medium text-zinc-900">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
              <Toggle
                checked={notifs[key]}
                onChange={(val) => setNotifs((n) => ({ ...n, [key]: val }))}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Card 5: Danger Zone ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-zinc-500 mt-0.5">These actions are irreversible. Please proceed with caution.</p>
        </div>
        <div className="divide-y divide-zinc-50">

          {/* Clear All Orders */}
          <div className="pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-900">Clear All Orders</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Permanently delete all order history. This action cannot be undone.
                </p>
              </div>
              {!pendingClear ? (
                <button
                  onClick={() => setPendingClear(true)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Clear Orders
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-red-600 font-medium">Are you sure?</span>
                  <button
                    onClick={() => { showToast('All orders cleared'); setPendingClear(false); }}
                    className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                  >
                    Yes, Clear
                  </button>
                  <button
                    onClick={() => setPendingClear(false)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reset Store Data */}
          <div className="pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-900">Reset Store Data</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Reset all products, customers and orders to factory defaults.
                </p>
              </div>
              {!pendingReset ? (
                <button
                  onClick={() => setPendingReset(true)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Reset Store
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-red-600 font-medium">Are you sure?</span>
                  <button
                    onClick={() => { showToast('Store data reset to defaults'); setPendingReset(false); }}
                    className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setPendingReset(false)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
