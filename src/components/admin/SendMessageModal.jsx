import { useEffect, useState } from 'react';
import { X, Send, MessageSquare, AlertCircle } from '../MaterialIcon';
import { messagesApi } from '../../api/customers.js';

export default function SendMessageModal({ customers, onClose, onSent }) {
  const [message, setMessage] = useState('');
  const [phoneOverride, setPhoneOverride] = useState('');
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const single = customers.length === 1 ? customers[0] : null;

  useEffect(() => {
    if (!single?.id) return;
    const load = () => messagesApi.list(single.id).then(setThread).catch(() => setError('Unable to load messages.'));
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [single?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return setError('Please enter a message.');
    setLoading(true); setError(''); setResults(null);
    try {
      const data = await messagesApi.send({
        customerIds: customers.map((c) => c.id),
        message: message.trim(),
        phone: phoneOverride.trim() || undefined,
      });
      if (single) setThread((items) => [data.message, ...items]);
      setResults(data.results || [{ success: true }]);
      setMessage('');
      onSent?.(data.results);
    } catch (err) { setError(err.message || 'Failed to send message'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2"><MessageSquare size={18} className="text-orange-500" /><h2 className="font-serif font-bold text-zinc-900">{single ? `Messages · ${single.name}` : `Message ${customers.length} Customers`}</h2></div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
        </div>

        {single && (
          <div className="h-72 overflow-y-auto bg-zinc-50/70 p-4 space-y-3">
            {thread.length ? thread.slice().reverse().map((item) => (
              <div key={item.id} className={`flex ${item.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${item.sender === 'admin' ? 'bg-orange-500 text-white' : 'bg-white text-zinc-700 shadow-sm'}`}>
                  <p>{item.body}</p><span className="mt-1 block text-[10px] opacity-60">{item.sender === 'admin' ? 'You' : single.name}</span>
                </div>
              </div>
            )) : <p className="pt-24 text-center text-sm text-zinc-400">No messages yet.</p>}
          </div>
        )}

        <form onSubmit={handleSend} className="p-5 space-y-3">
          {!single && <div className="bg-zinc-50 rounded-xl px-4 py-3 text-sm text-zinc-600">Sending an in-app message to <strong>{customers.length}</strong> selected customers.</div>}
          {single && <div className="text-xs text-zinc-500">Replies from the customer will appear here automatically.</div>}
          <textarea rows={3} placeholder="Write a message…" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
          <div className="flex items-center gap-2">
            <input type="tel" placeholder="Optional SMS phone override" value={phoneOverride} onChange={(e) => setPhoneOverride(e.target.value)} className="min-w-0 flex-1 px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-300" />
            <button disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Send size={16} />{loading ? 'Sending…' : 'Send'}</button>
          </div>
          <p className="text-[11px] text-zinc-400">Messages are delivered inside the customer account. If a phone is available, the server also logs the SMS delivery simulation.</p>
          {error && <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle size={15} />{error}</p>}
          {results && <p className="text-sm text-emerald-600">Message sent successfully.</p>}
        </form>
      </div>
    </div>
  );
}
