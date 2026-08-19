import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Check,
} from '../components/MaterialIcon';
import { useCustomerAuth } from '../context/CustomerAuthContext';

/* ── Kente SVG overlay ───────────────────────────────────────────────────── */
function KentePattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="customer-login-kente"
          x="0" y="0"
          width="60" height="60"
          patternUnits="userSpaceOnUse"
        >
          <rect width="60" height="60" fill="none" />
          <rect x="0"  y="0"  width="20" height="20" fill="#ffffff" opacity="0.08" />
          <rect x="20" y="20" width="20" height="20" fill="#ffffff" opacity="0.08" />
          <rect x="40" y="40" width="20" height="20" fill="#ffffff" opacity="0.08" />
          <line x1="0"  y1="30" x2="60" y2="30" stroke="#ffffff" strokeWidth="0.5" opacity="0.12" />
          <line x1="30" y1="0"  x2="30" y2="60" stroke="#ffffff" strokeWidth="0.5" opacity="0.12" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#customer-login-kente)" />
    </svg>
  );
}

const BENEFITS = [
  'Track your orders in real time',
  'Exclusive member discounts',
  'Saved wishlist & faster checkout',
];

export default function CustomerLogin() {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || data?.message || 'Invalid email or password. Please try again.');
        return;
      }
      login({ ...data.customer, token: data.token });
      navigate('/', { replace: true });
    } catch {
      setError('We could not reach the account service. Start the app with "npm run dev" and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── Left panel: branding ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 bg-gradient-to-br from-orange-500 to-orange-700">
        <KentePattern />

        {/* Soft glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md w-full">
          {/* Logo */}
          <div className="w-16 h-16 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl flex items-center justify-center mb-10 shadow-xl">
            <span className="text-white font-serif font-bold text-3xl leading-none">A</span>
          </div>

          <h1 className="font-serif text-5xl font-bold text-white mb-5 leading-tight">
            Welcome<br />back
          </h1>
          <p className="text-orange-100 text-lg leading-relaxed mb-10">
            Sign in to track your orders, save your wishlist, and get exclusive offers.
          </p>

          {/* Benefit bullets */}
          <ul className="space-y-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="text-white" strokeWidth={3} />
                </span>
                <span className="text-orange-50 text-sm font-medium">{benefit}</span>
              </li>
            ))}
          </ul>

          <p className="text-orange-200/60 text-xs mt-14">
            © {new Date().getFullYear()} Alice · African Fashion Boutique
          </p>
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
              <span className="text-white font-serif font-bold text-xl leading-none">A</span>
            </div>
            <span className="font-serif font-bold text-2xl text-zinc-900">Alice</span>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-zinc-900 mb-2">Sign in</h2>
            <p className="text-zinc-500 text-sm">Welcome back to Alice</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-12 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Forgot password */}
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-orange-200 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-zinc-500 mt-8">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
