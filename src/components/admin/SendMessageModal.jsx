import { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle, Check } from '../MaterialIcon';
import { messagesApi } from '../../api/customers.js';

export default function SendMessageModal({ customers, onClose, onSent }) {
  const [message, setMessage] = useState('');
  const [phoneOverride, setPhoneOverride] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const single = customers.length === 1 ? customers[0] : null;
  const needsPhone = single && !single.phone;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const data = await messagesApi.send({
        customerIds: customers.map((c) => c.id),
        message: message.trim(),
        phone: phoneOverride.trim() || undefined,
      });
      setResults(data.results);
      onSent?.(data.results);
      if (data.results.every((r) => r.success)) {
        setTimeout(onClose, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-orange-500" />
            <h2 className="font-serif font-bold text-zinc-900">
              {customers.length === 1 ? 'Send Text' : `Text ${customers.length} Customers`}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-5 space-y-4">
          <div className="bg-zinc-50 rounded-xl px-4 py-3 text-sm">
            {customers.length === 1 ? (
              <>
                <p className="font-semibold text-zinc-900">{single.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{single.email}</p>
                {single.phone ? (
                  <p className="text-zinc-600 text-xs mt-1">📱 {single.phone}</p>
                ) : (
                  <p className="text-amber-600 text-xs mt-1">No phone on file — enter one below</p>
                )}
              </>
            ) : (
              <p className="text-zinc-600">
                Sending to <strong>{customers.length}</strong> selected customers
              </p>
            )}
          </div>

          {(needsPhone || customers.length > 1) && (
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                {needsPhone ? 'Phone number' : 'Override phone (optional, single recipient only)'}
              </label>
              <input
                type="tel"
                placeholder="+233 24 000 0000"
                value={phoneOverride}
                onChange={(e) => setPhoneOverride(e.target.value)}
                disabled={customers.length > 1}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-zinc-50"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Message</label>
            <textarea
              rows={4}
              placeholder="Hi! We have new kente arrivals just for you…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={320}
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none"
            />
            <p className="text-[10px] text-zinc-400 mt-1 text-right">{message.length}/320</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {results && (
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {results.map((r) => (
                <div
                  key={r.customerId}
                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                    r.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {r.success ? <Check size={12} /> : <AlertCircle size={12} />}
                  {r.name}: {r.success ? 'Sent' : r.error}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {loading ? 'Sending…' : (
              <>
                <Send size={15} />
                Send Text
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
