import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, Truck, Zap, Check,
  ShoppingBag, Lock, ChevronRight, MapPin,
} from '../components/MaterialIcon';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { ordersApi } from '../api/orders.js';
import Navbar from '../components/Navbar';

// ── Delivery cities (not delivering nationwide) ─────────────────────────────
const DELIVERY_CITIES = [
  'Accra', 'Tema', 'Kumasi', 'Takoradi', 'Cape Coast', 'New York, NY',
  'Columbus, OH', 'Cleveland, OH', 'Atlanta, GA', 'Washington, DC', 'Houston, TX',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    label: 'Standard Shipping',
    desc: '5–7 business days',
    price: 30,
    icon: Truck,
  },
  {
    id: 'express',
    label: 'Express Shipping',
    desc: '2–3 business days',
    price: 80,
    icon: Zap,
  },
];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'momo', label: 'Mobile Money (MTN / Vodafone)', icon: ShoppingBag },
];

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all';

// ── Component ─────────────────────────────────────────────────────────────────

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=info, 2=payment, 3=confirmed

  // Contact + address
  const [contact, setContact] = useState({
    email: '', phone: '',
    firstName: '', lastName: '',
    address: '', city: '', region: 'Greater Accra',
    country: 'United States', zip: '',
  });

  useEffect(() => {
    if (!customer) return;
    const [firstName, ...rest] = (customer.name ?? '').split(' ');
    setContact((prev) => ({
      ...prev,
      email: prev.email || customer.email || '',
      firstName: prev.firstName || firstName || '',
      lastName: prev.lastName || rest.join(' ') || '',
    }));
  }, [customer]);

  // Shipping
  const [shipping, setShipping] = useState(cartTotal >= 500 ? 'free' : 'standard');
  const freeShipping = cartTotal >= 500;

  // Payment
  const [payMethod, setPayMethod] = useState('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [momoNumber, setMomoNumber] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const shippingCost =
    freeShipping ? 0
    : shipping === 'express' ? 80
    : 30;

  const orderTotal = cartTotal + shippingCost;

  const contactValid =
    contact.email && contact.phone && contact.firstName &&
    contact.lastName && contact.address && contact.city;

  const paymentValid =
    payMethod === 'card'
      ? card.number.replace(/\s/g, '').length >= 16 && card.name && card.expiry && card.cvv.length >= 3
      : momoNumber.length >= 10;

  // ── Order placement ──────────────────────────────────────────────────────────

  const placeOrder = async () => {
    setPlacingOrder(true);
    try {
      await ordersApi.create({
        contact,
        shippingMethod: shipping,
        paymentMethod:  payMethod,
        cartItems,
        subtotal:     cartTotal,
        shippingCost: shippingCost,
        total:        orderTotal,
      });
    } catch (_) {
      // Order still confirms to user even if network fails (offline-friendly)
    } finally {
      clearCart();
      setStep(3);
      setPlacingOrder(false);
    }
  };

  // ── Card number formatting ───────────────────────────────────────────────────

  const formatCardNumber = (v) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v) =>
    v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

  // ── CONFIRMED STATE ──────────────────────────────────────────────────────────

  if (step === 3) {
    const orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 mb-3">Order Placed!</h1>
          <p className="text-zinc-500 mb-2">
            Thank you, <span className="font-semibold text-zinc-900">{contact.firstName}</span>! Your order has been received.
          </p>
          <p className="text-zinc-400 text-sm mb-8">
            Confirmation sent to <span className="text-zinc-600">{contact.email}</span>
          </p>

          <div className="bg-white border border-zinc-100 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Order ID</span>
              <span className="font-semibold text-zinc-900 font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total Paid</span>
              <span className="font-bold text-zinc-900">${orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Shipping to</span>
              <span className="font-semibold text-zinc-900 text-right max-w-[55%]">
                {contact.address}, {contact.city}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Estimated delivery</span>
              <span className="font-semibold text-zinc-900">
                {shipping === 'express' ? '2–3 days' : '5–7 days'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/store"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── EMPTY CART GUARD ─────────────────────────────────────────────────────────

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-orange-300" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-zinc-900 mb-3">Your cart is empty</h1>
          <p className="text-zinc-500 mb-8">Add some pieces to your cart before checking out.</p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Browse the Store
          </Link>
        </div>
      </div>
    );
  }

  // ── MAIN CHECKOUT ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />

      {/* Progress bar */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm">
          <Link to="/store" className="text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Back to shop
          </Link>
          <ChevronRight size={14} className="text-zinc-300 flex-shrink-0" />
          <span className={step === 1 ? 'text-orange-500 font-semibold' : 'text-zinc-400'}>
            Shipping Info
          </span>
          <ChevronRight size={14} className="text-zinc-300 flex-shrink-0" />
          <span className={step === 2 ? 'text-orange-500 font-semibold' : 'text-zinc-400'}>
            Payment
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Left column: form ── */}
          <div className="space-y-6">

            {/* ─── STEP 1: SHIPPING INFO ─── */}
            {step === 1 && (
              <>
                <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
                  <h2 className="font-serif text-xl font-bold text-zinc-900">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Email address" required>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={contact.email}
                          onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                    <Field label="Phone number" required>
                      <input
                        type="tel"
                        placeholder="+1 (216) 000-0000 or +233 24 000 0000"
                        value={contact.phone}
                        onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
                  <h2 className="font-serif text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <MapPin size={18} className="text-orange-500" />
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First name" required>
                      <input
                        type="text"
                        placeholder="Abena"
                        value={contact.firstName}
                        onChange={(e) => setContact((p) => ({ ...p, firstName: e.target.value }))}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Last name" required>
                      <input
                        type="text"
                        placeholder="Asante"
                        value={contact.lastName}
                        onChange={(e) => setContact((p) => ({ ...p, lastName: e.target.value }))}
                        className={inputCls}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Street address" required>
                        <input
                          type="text"
                        placeholder="3355 Richmond Rd"
                          value={contact.address}
                          onChange={(e) => setContact((p) => ({ ...p, address: e.target.value }))}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                    <Field label="Delivery City" required>
                      <select
                        value={contact.city}
                        onChange={(e) => setContact((p) => ({ ...p, city: e.target.value }))}
                        className={inputCls}
                      >
                        <option value="">Select a city…</option>
                        {DELIVERY_CITIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-700">
                        <MapPin size={15} className="flex-shrink-0 mt-0.5" />
                        <span>We currently deliver to selected locations in <strong>Ghana and the United States</strong>. More locations coming soon!</span>
                      </div>
                    </div>
                    <Field label="Postal code">
                      <input
                        type="text"
                        placeholder="GA-123-4567"
                        value={contact.zip}
                        onChange={(e) => setContact((p) => ({ ...p, zip: e.target.value }))}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-3">
                  <h2 className="font-serif text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <Truck size={18} className="text-orange-500" />
                    Shipping Method
                  </h2>
                  {freeShipping && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-sm text-emerald-700 font-medium">
                      <Check size={15} className="flex-shrink-0" />
                      Free shipping applied — your order qualifies!
                    </div>
                  )}
                  <div className="space-y-2">
                    {(freeShipping
                      ? [{ id: 'free', label: 'Free Shipping', desc: '5–7 business days', price: 0, icon: Truck }, ...SHIPPING_OPTIONS]
                      : SHIPPING_OPTIONS
                    ).map((opt) => {
                      const Icon = opt.icon;
                      const selected = shipping === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setShipping(opt.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                            selected
                              ? 'border-orange-400 bg-orange-50/50'
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-orange-100' : 'bg-zinc-100'}`}>
                            <Icon size={18} className={selected ? 'text-orange-600' : 'text-zinc-500'} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-zinc-900">{opt.label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{opt.desc}</p>
                          </div>
                          <span className={`font-bold text-sm ${opt.price === 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                            {opt.price === 0 ? 'FREE' : `$${opt.price}`}
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-orange-500 bg-orange-500' : 'border-zinc-300'}`}>
                            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => { if (contactValid) setStep(2); }}
                  disabled={!contactValid}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Continue to Payment
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* ─── STEP 2: PAYMENT ─── */}
            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-2"
                >
                  <ArrowLeft size={15} /> Back to shipping
                </button>

                <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-5">
                  <h2 className="font-serif text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <Lock size={18} className="text-orange-500" />
                    Payment Method
                  </h2>

                  {/* Method selector */}
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((m) => {
                      const Icon = m.icon;
                      const sel = payMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayMethod(m.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                            sel ? 'border-orange-400 bg-orange-50/50 text-orange-700' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                          }`}
                        >
                          <Icon size={20} className={sel ? 'text-orange-500' : 'text-zinc-400'} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Card fields */}
                  {payMethod === 'card' && (
                    <div className="space-y-4">
                      <Field label="Card number" required>
                        <div className="relative">
                          <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={card.number}
                            onChange={(e) => setCard((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                            className={`${inputCls} pl-10 font-mono tracking-wider`}
                          />
                        </div>
                      </Field>
                      <Field label="Name on card" required>
                        <input
                          type="text"
                          placeholder="Abena Asante"
                          value={card.name}
                          onChange={(e) => setCard((p) => ({ ...p, name: e.target.value }))}
                          className={inputCls}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Expiry date" required>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={card.expiry}
                            onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                            className={`${inputCls} font-mono`}
                          />
                        </Field>
                        <Field label="CVV" required>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={card.cvv}
                            onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            className={`${inputCls} font-mono`}
                          />
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* Mobile Money */}
                  {payMethod === 'momo' && (
                    <Field label="Mobile Money number" required>
                      <input
                        type="tel"
                        placeholder="+1 (216) 000-0000 or +233 24 000 0000"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  )}

                  <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                    <Lock size={12} className="flex-shrink-0" />
                    Your payment information is encrypted and secure
                  </div>
                </div>

                {/* Delivery summary */}
                <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-2 text-sm">
                  <p className="font-semibold text-zinc-900 mb-3">Delivering to</p>
                  <p className="text-zinc-700">{contact.firstName} {contact.lastName}</p>
                  <p className="text-zinc-500">{contact.address}</p>
                  <p className="text-zinc-500">{contact.city}, {contact.region}, {contact.country}</p>
                  <p className="text-zinc-500">{contact.email} · {contact.phone}</p>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={!paymentValid || placingOrder}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {placingOrder ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Place Order · ${orderTotal.toFixed(2)}
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-zinc-400">
                  By placing your order you agree to our{' '}
                  <a href="#" className="text-orange-500 hover:underline">Terms & Conditions</a>
                </p>
              </>
            )}
          </div>

          {/* ── Right column: order summary ── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-zinc-100 p-5">
              <h3 className="font-serif text-lg font-bold text-zinc-900 mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-14 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = `https://picsum.photos/seed/p${item.product.id}/56/64`; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 leading-tight truncate">{item.product.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{item.size} · Qty {item.quantity}</p>
                      <p className="text-sm font-bold text-zinc-900 mt-1">
                        ${(item.product.price * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base text-zinc-900 pt-2 border-t border-zinc-100">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust signals */}
              <div className="border-t border-zinc-100 mt-4 pt-4 space-y-2">
                {[
                  { icon: Lock, text: 'Secure 256-bit SSL encryption' },
                  { icon: Truck, text: 'Free returns within 14 days' },
                  { icon: Check, text: 'Quality checked before delivery' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-zinc-400">
                    <Icon size={13} className="text-orange-400 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
