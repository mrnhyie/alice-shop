import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from '../../components/MaterialIcon';
import { useAuth } from '../../context/AuthContext';

function GeometricPattern({ className = '' }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="login-kente" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="none" />
          <rect x="0"  y="0"  width="20" height="20" fill="#f97316" opacity="0.3" />
          <rect x="20" y="20" width="20" height="20" fill="#f97316" opacity="0.3" />
          <rect x="40" y="40" width="20" height="20" fill="#f97316" opacity="0.3" />
          <line x1="0" y1="30" x2="60" y2="30" stroke="#f97316" strokeWidth="0.5" opacity="0.15" />
          <line x1="30" y1="0" x2="30" y2="60" stroke="#f97316" strokeWidth="0.5" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#login-kente)" />
    </svg>
  );
}

export default function AdminLogin() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    // Simulate a brief network delay for realism
    await new Promise((r) => setTimeout(r, 700));
    const success = login(username.trim(), password);
    if (success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-zinc-900 overflow-hidden">
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12">
        <GeometricPattern className="opacity-[0.04]" />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-900/50">
            <span className="text-white font-serif font-bold text-4xl leading-none">A</span>
          </div>

          <h1 className="font-serif text-5xl font-bold text-white mb-4 leading-tight">
            Alice Admin
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-10">
            Your central hub for managing products, orders, customers, and analytics.
          </p>

          {/* Stats teaser */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '1,183', label: 'Orders' },
              { value: '892', label: 'Customers' },
              { value: '$47K', label: 'Revenue' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4">
                <div className="font-serif text-2xl font-bold text-orange-400">{value}</div>
                <div className="text-zinc-500 text-xs uppercase tracking-wide mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <p className="text-zinc-600 text-xs mt-10">
            © {new Date().getFullYear()} Alice Ghana · Admin Portal
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xl leading-none">A</span>
            </div>
            <span className="font-serif font-bold text-2xl text-zinc-900">Alice Admin</span>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-zinc-900 mb-2">Welcome back</h2>
            <p className="text-zinc-500 text-sm">Sign in to access the admin dashboard</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
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
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
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
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-orange-200 mt-2"
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

          <p className="text-center text-xs text-zinc-400 mt-6">
            Alice Ghana Admin Portal · Secure access only
          </p>
        </div>
      </div>
    </div>
  );
}
