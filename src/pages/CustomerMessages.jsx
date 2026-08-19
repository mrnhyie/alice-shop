import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send } from '../components/MaterialIcon';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { messagesApi } from '../api/customers';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function CustomerMessages() {
  const { customer, isLoggedIn } = useCustomerAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (customer?.id) messagesApi.list(customer.id).then(setMessages).catch(() => setError('Unable to load messages.')); }, [customer?.id]);
  const send = async (event) => {
    event.preventDefault(); if (!body.trim() || !customer?.id) return;
    try { const message = await messagesApi.send({ customerId: customer.id, message: body }); setMessages((items) => [message, ...items]); setBody(''); } catch (err) { setError(err.message || 'Unable to send your message.'); }
  };
  if (!isLoggedIn) return <div className="min-h-screen bg-zinc-50"><Navbar /><main className="mx-auto max-w-xl px-6 py-24 text-center"><h1 className="font-serif text-3xl font-bold">Sign in to view messages</h1><Link to="/login" className="mt-5 inline-block text-orange-600">Sign in</Link></main></div>;
  return <div className="min-h-screen bg-zinc-50"><Navbar /><main className="mx-auto max-w-3xl px-5 py-10"><Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500"><ArrowLeft size={16} /> Back home</Link><div className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm"><div className="border-b border-zinc-100 px-6 py-5"><h1 className="font-serif text-3xl font-bold text-zinc-900">Messages</h1><p className="mt-1 text-sm text-zinc-500">Talk directly with the Culture Connect team.</p></div><div className="min-h-[320px] space-y-3 bg-zinc-50/70 p-5">{messages.length ? messages.slice().reverse().map((message) => <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.sender === 'customer' ? 'bg-orange-500 text-white' : 'bg-white text-zinc-700 shadow-sm'}`}><p>{message.body}</p><span className="mt-1 block text-[10px] opacity-60">{message.sender === 'customer' ? 'You' : 'Culture Connect'}</span></div></div>) : <p className="pt-24 text-center text-sm text-zinc-400">No messages yet. Send us a note and we’ll get back to you.</p>}</div><form onSubmit={send} className="flex gap-3 border-t border-zinc-100 p-4"><input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message…" className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-orange-400" /><button className="inline-flex items-center gap-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white"><Send size={16} /> Send</button></form>{error && <p className="px-5 pb-4 text-sm text-red-600">{error}</p>}</div></main><Footer /></div>;
}
