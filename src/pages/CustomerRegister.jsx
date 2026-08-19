import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Lock, Mail, User, AlertCircle, ArrowRight,
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
          id="customer-register-kente"
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
      <rect width="100%" height="100%" fill="url(#customer-register-kente)" />
    </svg>
  );
}

/* ── Password strength indicator ─────────────────────────────────────────── */
// Bars fill orange progressively at lengths 6, 8, 10, 12
const STRENGTH_THRESHOLDS = [6, 8, 10, 12];
const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

function PasswordStrength({ password }) {
  const filled = STRENGTH_THRESHOLDS.filter((t) => password.length >= t).length;
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {STRENGTH_THRESHOLDS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < filled ? 'bg-orange-500' : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>
      {filled > 0 && (
        <p className={`text-xs mt-1 font-medium ${
          filled === 4 ? 'text-green-600'
          : filled >= 2 ? 'text-orange-500'
          : 'text-red-500'
        }`}>
          {STRENGTH_LABELS[filled - 1]}
        </p>
      )}
    </div>
  );
}

/* ── Validation helpers ──────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, password, confirmPassword, agreed }) {
  if (!name.trim())                       return 'Please enter your full name.';
  if (!EMAIL_RE.test(email.trim()))       return 'Please enter a valid email address.';
  if (password.length < 6)               return 'Password must be at least 6 characters.';
  if (password !== confirmPassword)       return 'Passwords do not match.';
  if (!agreed)                            return 'Please accept the Terms of Service to continue.';
  return null;
}

export default function CustomerRegister() {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();

  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [agreed, setAgreed]              = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const clearError = () => setError('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate({ name, email, password, confirmPassword, agreed });
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || data?.message || 'Registration failed. Please try again.');
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
            Join<br />Alice
          </h1>
          <p className="text-orange-100 text-lg leading-relaxed mb-10">
            Create your account and discover authentic African fashion.
          </p>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5">
            <div className="grid grid-cols-3 divide-x divide-white/20 text-center">
              {[
                { value: '500+', label: 'Products' },
                { value: '100+', label: 'Styles' },
                { value: '🌍',   label: 'Worldwide' },
              ].map(({ value, label }) => (
                <div key={label} className="px-4 first:pl-0 last:pr-0">
                  <div className="font-serif text-2xl font-bold text-white">{value}</div>
                  <div className="text-orange-100/70 text-xs uppercase tracking-wide mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-orange-200/60 text-xs mt-14">
            © {new Date().getFullYear()} Alice · African Fashion Boutique
          </p>
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
              <span className="text-white font-serif font-bold text-xl leading-none">A</span>
            </div>
            <span className="font-serif font-bold text-2xl text-zinc-900">Alice</span>
          </div>

          <div className="mb-7">
            <h2 className="font-serif text-3xl font-bold text-zinc-900 mb-2">Create account</h2>
            <p className="text-zinc-500 text-sm">Join thousands of Alice customers</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Ama Owusu"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError(); }}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

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
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* Password + strength */}
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
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
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
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirm(e.target.value); clearError(); }}
                  className="w-full pl-10 pr-12 py-3 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); clearError(); }}
                className="mt-0.5 w-4 h-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400 focus:ring-2 cursor-pointer"
              />
              <span className="text-sm text-zinc-600 leading-relaxed">
                I agree to the{' '}
                <button type="button" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-orange-200 mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-zinc-500 mt-8">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
