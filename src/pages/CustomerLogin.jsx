import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from '../components/MaterialIcon';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import logo from '../assets/culture-connect-logo.webp';

import bg1 from '../assets/pexels-akoonie-29663368.jpg';
import bg2 from '../assets/pexels-alpha-paul-696966661-18206793.jpg';
import bg3 from '../assets/pexels-zeal-creative-studios-58866141-20618742.jpg';
import bg4 from '../assets/pexels-malaydi-12175082.jpg';

const BG_IMAGES = [bg1, bg2, bg3, bg4];

const TESTIMONIALS = [
  { name: 'Ama K.',    text: 'Found the most beautiful kente pieces here!', rating: 5 },
  { name: 'David O.',  text: 'Fast delivery and amazing quality fabrics.',   rating: 5 },
  { name: 'Fatima A.', text: 'Love the fusion of modern and traditional.',   rating: 5 },
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
  const [tIdx, setTIdx]         = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBgIdx((i) => (i + 1) % BG_IMAGES.length), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTIdx((i) => (i + 1) % TESTIMONIALS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || 'Invalid email or password.'); return; }
      login({ ...data.customer, token: data.token });
      navigate('/', { replace: true });
    } catch { setError('Could not reach the server. Please try again.'); }
    finally  { setLoading(false); }
  };

  const t = TESTIMONIALS[tIdx];

  return (
    <div className="min-h-screen flex overflow-hidden bg-zinc-50">

      {/* ── Cycling background ────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0">
        {BG_IMAGES.map((src, i) => (
          <img key={src} src={src} alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === bgIdx ? 1 : 0 }}
          />
        ))}
        {/* left panel: semi-dark for text legibility; right panel: fade to near-white */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-white/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15" />
      </div>

      {/* ── Left branding panel (desktop) ────────────────────────────────── */}
      <div className="hidden lg:flex relative z-10 w-[48%] flex-col justify-between p-14">
        <img src={logo} alt="Alice" className="h-10 w-auto object-contain self-start" />

        <div>
          <p className="text-orange-300 text-sm font-semibold uppercase tracking-[0.2em] mb-4">African Fashion Boutique</p>
          <h1 className="font-serif text-6xl font-bold text-white leading-[1.08] mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Where Africa<br />
            <em className="not-italic text-orange-300">meets fashion.</em>
          </h1>
          <p className="text-white/75 text-base leading-relaxed max-w-xs">
            Authentic kente weaves, contemporary Afro-fusion, and artisan craft — delivered worldwide.
          </p>

          {/* Testimonial card */}
          <div className="mt-10 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-5 max-w-xs">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, i) => (
                <span key={i} className="material-symbols-outlined text-amber-300" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <p className="text-white text-sm leading-relaxed font-medium">"{t.text}"</p>
            <p className="text-white/50 text-xs mt-2">— {t.name}</p>
            <div className="flex gap-1.5 mt-3">
              {TESTIMONIALS.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-300 ${i === tIdx ? 'w-4 h-1.5 bg-orange-300' : 'w-1.5 h-1.5 bg-white/25'}`} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-white/30 text-xs">© {new Date().getFullYear()} Alice · Carry Culture With You</p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="Alice" className="h-9 w-auto object-contain" />
          </div>

          {/* White card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/80 p-8 border border-zinc-100">
            <div className="mb-7">
              <h2 className="font-serif text-[2rem] font-bold text-zinc-900 leading-tight mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Welcome back
              </h2>
              <p className="text-zinc-400 text-sm">Sign in to your Alice account</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type="email" autoComplete="email" placeholder="you@example.com"
                    value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password"
                    value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-11 py-3 text-sm bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-orange-200 mt-2">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>Signing in…</>
                ) : <><span>Sign In</span><ArrowRight size={15} /></>}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="text-zinc-400 text-xs">New to Alice?</span>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>

            <Link to="/register"
              className="w-full flex items-center justify-center py-2.5 px-6 border border-zinc-200 hover:border-orange-300 hover:bg-orange-50 text-zinc-600 hover:text-orange-600 font-semibold text-sm rounded-full transition-all duration-200">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
