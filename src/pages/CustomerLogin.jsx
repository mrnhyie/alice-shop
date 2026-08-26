import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight,
} from '../components/MaterialIcon';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import logo from '../assets/culture-connect-logo.webp';

/* ── Background images ─────────────────────────────────────────────────────── */
import bg1 from '../assets/pexels-akoonie-29663368.jpg';
import bg2 from '../assets/pexels-alpha-paul-696966661-18206793.jpg';
import bg3 from '../assets/pexels-zeal-creative-studios-58866141-20618742.jpg';
import bg4 from '../assets/pexels-malaydi-12175082.jpg';

const BG_IMAGES = [bg1, bg2, bg3, bg4];

/* ── Floating testimonial cards ──────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Ama K.',    text: 'Found the most beautiful kente pieces here!', rating: 5 },
  { name: 'David O.',  text: 'Fast delivery and amazing quality fabrics.',   rating: 5 },
  { name: 'Fatima A.', text: 'Love the fusion of modern and traditional.',    rating: 5 },
];

export default function CustomerLogin() {
  const { login }  = useCustomerAuth();
  const navigate   = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [bgIdx, setBgIdx]       = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Cycle background every 7s
  useEffect(() => {
    const t = setInterval(() => setBgIdx((i) => (i + 1) % BG_IMAGES.length), 7000);
    return () => clearInterval(t);
  }, []);

  // Cycle testimonial every 4s
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Invalid email or password. Please try again.');
        return;
      }
      login({ ...data.customer, token: data.token });
      navigate('/', { replace: true });
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div className="min-h-screen flex bg-zinc-950 overflow-hidden">

      {/* ── Background images ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0">
        {BG_IMAGES.map((src, i) => (
          <img key={src} src={src} alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === bgIdx ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-zinc-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-950/50" />
      </div>

      {/* ── Glow blobs ────────────────────────────────────────────────────── */}
      <div className="fixed top-1/3 left-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/4 right-1/3 w-64 h-64 bg-orange-600/6 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ── Left branding panel (desktop) ─────────────────────────────────── */}
      <div className="hidden lg:flex relative z-10 w-1/2 flex-col justify-between p-14">
        {/* Logo */}
        <img src={logo} alt="Alice" className="h-10 w-auto object-contain self-start drop-shadow-lg" />

        {/* Hero copy */}
        <div>
          <h1 className="font-serif text-6xl font-bold text-white leading-[1.1] mb-5">
            Where Africa<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
              meets fashion.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
            Authentic African fashion — from kente weaves to contemporary Afro-fusion, delivered worldwide.
          </p>

          {/* Rotating testimonial */}
          <div className="mt-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 max-w-sm transition-all duration-500">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, i) => (
                <span key={i} className="material-symbols-outlined text-amber-400" style={{ fontSize: 16 }}>star</span>
              ))}
            </div>
            <p className="text-white text-sm font-medium leading-relaxed">"{t.text}"</p>
            <p className="text-zinc-500 text-xs mt-2">— {t.name}</p>

            {/* dots */}
            <div className="flex gap-1.5 mt-3">
              {TESTIMONIALS.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-300 ${
                  i === testimonialIdx ? 'w-4 h-1.5 bg-orange-400' : 'w-1.5 h-1.5 bg-zinc-600'
                }`} />
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-8">
            {[
              { value: '500+', label: 'Products' },
              { value: '50+',  label: 'Artisans' },
              { value: '🌍',   label: 'Worldwide' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-serif text-2xl font-bold text-white">{value}</div>
                <div className="text-zinc-500 text-xs uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} Alice · African Fashion Boutique</p>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-14">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="Alice" className="h-9 w-auto object-contain drop-shadow-lg" />
          </div>

          {/* Card */}
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
            <div className="mb-7">
              <h2 className="font-serif text-3xl font-bold text-white mb-1.5">Welcome back</h2>
              <p className="text-zinc-400 text-sm">Sign in to your Alice account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email" autoComplete="email" placeholder="you@example.com"
                    value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-zinc-800/70 border border-white/10 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button type="button"
                    className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password"
                    value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-11 py-3 text-sm bg-zinc-800/70 border border-white/10 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-lg shadow-orange-900/40 mt-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-zinc-600 text-xs">New to Alice?</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            <Link to="/register"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-6 border border-white/10 hover:border-orange-500/40 hover:bg-orange-500/5 text-zinc-300 hover:text-white font-semibold text-sm rounded-full transition-all duration-200">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
