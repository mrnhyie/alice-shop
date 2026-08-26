import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MaterialIcon, {
  Eye, EyeOff, Lock, Mail, User, Phone,
  ArrowRight, ArrowLeft, Check, AlertCircle, AutoAwesome,
  Checkroom, Celebration, Diamond, NightLife, StyleIcon, WbSunny,
  Volunteer, Heart,
} from '../components/MaterialIcon';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import logo from '../assets/culture-connect-logo.webp';

/* ── Background images ─────────────────────────────────────────────────────── */
import bg1 from '../assets/pexels-santuraki-38209146.jpg';
import bg2 from '../assets/pexels-daniwura-tci-492293783-35048282.jpg';
import bg3 from '../assets/pexels-oluwadamilola-ajayi-1485601295-28521274.jpg';
import bg4 from '../assets/pexels-kahlibrown-30604266.jpg';

const BG_IMAGES = [bg1, bg2, bg3, bg4];

/* ── Quiz data ─────────────────────────────────────────────────────────────── */
const QUIZ = [
  {
    id: 'style',
    question: "What's your fashion style?",
    subtitle: 'Pick the vibe that matches you best.',
    icon: 'StyleIcon',
    options: [
      { id: 'traditional', label: 'Traditional', sub: 'Kente, Kaba & Slit', icon: 'Checkroom', color: 'from-amber-500 to-orange-600' },
      { id: 'modern',      label: 'Modern',      sub: 'Clean & contemporary', icon: 'Diamond',   color: 'from-violet-500 to-purple-700' },
      { id: 'fusion',      label: 'Fusion',       sub: 'Afro-contemporary mix', icon: 'AutoAwesome', color: 'from-rose-500 to-pink-700' },
      { id: 'casual',      label: 'Casual',       sub: 'Everyday comfort', icon: 'WbSunny',    color: 'from-sky-500 to-blue-700' },
    ],
  },
  {
    id: 'occasion',
    question: 'When do you dress up most?',
    subtitle: 'We\'ll personalise your feed around this.',
    icon: 'Celebration',
    options: [
      { id: 'weddings',   label: 'Weddings',    sub: 'Ceremonies & rites', icon: 'Volunteer',    color: 'from-pink-500 to-rose-700' },
      { id: 'parties',    label: 'Parties',     sub: 'Nights out & events', icon: 'NightLife',   color: 'from-purple-500 to-indigo-700' },
      { id: 'work',       label: 'Work',        sub: 'Office & meetings', icon: 'StyleIcon',    color: 'from-teal-500 to-emerald-700' },
      { id: 'everyday',   label: 'Everyday',    sub: 'Daily wear & errands', icon: 'Heart',     color: 'from-orange-400 to-amber-600' },
    ],
  },
];

/* ── Password strength ─────────────────────────────────────────────────────── */
const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];
function strengthScore(pw) {
  return [6, 8, 10, 12].filter((t) => pw.length >= t).length;
}

/* ── Validation ───────────────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── Main component ───────────────────────────────────────────────────────── */
export default function CustomerRegister() {
  const { login } = useCustomerAuth();
  const navigate  = useNavigate();

  // Quiz answers
  const [answers, setAnswers]   = useState({});
  // Form fields
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [agreed, setAgreed]     = useState(false);

  // UI state
  const [step, setStep]         = useState(0); // 0,1 = quiz; 2 = details
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [bgIdx, setBgIdx]       = useState(0);
  const [animDir, setAnimDir]   = useState('forward'); // for slide direction
  const [animKey, setAnimKey]   = useState(0);         // force re-mount for animation

  const TOTAL_STEPS = QUIZ.length + 1; // 2 quiz + 1 details

  // Cycle background image every 6s
  useEffect(() => {
    const t = setInterval(() => setBgIdx((i) => (i + 1) % BG_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  function goNext() {
    setAnimDir('forward');
    setAnimKey((k) => k + 1);
    setError('');
    setStep((s) => s + 1);
  }

  function goBack() {
    setAnimDir('back');
    setAnimKey((k) => k + 1);
    setError('');
    setStep((s) => s - 1);
  }

  function pickOption(quizId, optionId) {
    setAnswers((a) => ({ ...a, [quizId]: optionId }));
    setTimeout(goNext, 220); // slight delay so selection is visible
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim())                      return setError('Please enter your full name.');
    if (!EMAIL_RE.test(email.trim()))      return setError('Please enter a valid email address.');
    if (password.length < 6)              return setError('Password must be at least 6 characters.');
    if (password !== confirm)             return setError('Passwords do not match.');
    if (!agreed)                           return setError('Please accept the Terms to continue.');

    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || 'Registration failed. Please try again.'); return; }
      login({ ...data.customer, token: data.token });
      navigate('/', { replace: true });
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const progress = Math.round(((step) / TOTAL_STEPS) * 100);
  const isQuiz   = step < QUIZ.length;
  const quiz     = isQuiz ? QUIZ[step] : null;
  const score    = strengthScore(password);

  return (
    <div className="min-h-screen flex items-stretch bg-zinc-950 overflow-hidden">

      {/* ── Background image (full bleed, dark overlay) ───────────────────── */}
      <div className="fixed inset-0 z-0">
        {BG_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === bgIdx ? 1 : 0 }}
          />
        ))}
        {/* layered dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-950/75 to-zinc-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-transparent to-zinc-950/40" />
      </div>

      {/* ── Floating dots decoration ───────────────────────────────────────── */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-orange-600/8 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ── Main card ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 py-10 min-h-screen">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="Alice" className="h-9 w-auto object-contain drop-shadow-lg" />
        </div>

        {/* Card */}
        <div className="w-full max-w-lg bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

          {/* Progress bar */}
          <div className="h-1 bg-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="px-6 pt-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i < step
                      ? 'w-5 h-2 bg-orange-500'
                      : i === step
                      ? 'w-6 h-2 bg-orange-400'
                      : 'w-2 h-2 bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {step + 1} of {TOTAL_STEPS}
            </span>
          </div>

          {/* Step content — animated */}
          <div
            key={animKey}
            className={`px-6 py-6 ${
              animDir === 'forward'
                ? 'animate-[slideInRight_0.3s_ease-out]'
                : 'animate-[slideInLeft_0.3s_ease-out]'
            }`}
          >
            {/* ── Quiz steps ──────────────────────────────────────────────── */}
            {isQuiz && quiz && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MaterialIcon name={quiz.icon} size={22} className="text-orange-400" />
                  <span className="text-xs text-orange-400 font-semibold uppercase tracking-widest">
                    Question {step + 1}
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-1">{quiz.question}</h2>
                <p className="text-zinc-400 text-sm mb-6">{quiz.subtitle}</p>

                <div className="grid grid-cols-2 gap-3">
                  {quiz.options.map((opt) => {
                    const selected = answers[quiz.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => pickOption(quiz.id, opt.id)}
                        className={`relative group rounded-2xl p-4 text-left border transition-all duration-200 overflow-hidden ${
                          selected
                            ? 'border-orange-500 bg-orange-500/15 scale-[0.98]'
                            : 'border-white/10 bg-white/5 hover:border-orange-400/50 hover:bg-white/8 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        {/* gradient swatch top-right */}
                        <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-3xl bg-gradient-to-br ${opt.color} opacity-20 group-hover:opacity-30 transition-opacity`} />

                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center mb-3 shadow-lg`}>
                          <MaterialIcon name={opt.icon} size={18} className="text-white" />
                        </div>

                        <p className="font-semibold text-white text-sm leading-tight">{opt.label}</p>
                        <p className="text-zinc-400 text-xs mt-0.5">{opt.sub}</p>

                        {selected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Skip / back row */}
                <div className="flex items-center justify-between mt-6">
                  {step > 0 ? (
                    <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : <div />}
                  <button onClick={goNext} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                    Skip →
                  </button>
                </div>
              </div>
            )}

            {/* ── Details step ────────────────────────────────────────────── */}
            {!isQuiz && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AutoAwesome size={18} className="text-orange-400" />
                  <span className="text-xs text-orange-400 font-semibold uppercase tracking-widest">Almost there</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-1">Create your account</h2>
                <p className="text-zinc-400 text-sm mb-5">Just a few details and you're in.</p>

                {error && (
                  <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                    <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Full name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text" autoComplete="name" placeholder="Ama Owusu"
                        value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-800/70 border border-white/10 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="email" autoComplete="email" placeholder="you@example.com"
                        value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-800/70 border border-white/10 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Phone <span className="text-zinc-600 normal-case font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="tel" autoComplete="tel" placeholder="+233 24 000 0000"
                        value={phone} onChange={(e) => { setPhone(e.target.value); }}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-800/70 border border-white/10 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters"
                        value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="w-full pl-10 pr-11 py-2.5 text-sm bg-zinc-800/70 border border-white/10 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[0,1,2,3].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < score
                                ? score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-amber-400' : score === 3 ? 'bg-orange-400' : 'bg-emerald-500'
                                : 'bg-zinc-700'
                            }`} />
                          ))}
                        </div>
                        <p className={`text-xs mt-1 font-medium ${
                          score === 4 ? 'text-emerald-400' : score >= 2 ? 'text-orange-400' : 'text-red-400'
                        }`}>{STRENGTH_LABELS[score - 1]}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Confirm password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type={showCf ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter password"
                        value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                        className={`w-full pl-10 pr-11 py-2.5 text-sm bg-zinc-800/70 border text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-1 transition-all ${
                          confirm && confirm !== password
                            ? 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20'
                            : confirm && confirm === password
                            ? 'border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                            : 'border-white/10 focus:border-orange-500/60 focus:ring-orange-500/30'
                        }`}
                      />
                      <button type="button" onClick={() => setShowCf(!showCf)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      {confirm && (
                        <div className={`absolute right-9 top-1/2 -translate-y-1/2 ${confirm === password ? 'text-emerald-400' : 'text-red-400'}`}>
                          <MaterialIcon name={confirm === password ? 'Check' : 'X'} size={14} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                        agreed ? 'bg-orange-500 border-orange-500' : 'border-zinc-600 bg-zinc-800'
                      }`}
                    >
                      {agreed && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-xs text-zinc-400 leading-relaxed">
                      I agree to the{' '}
                      <button type="button" className="text-orange-400 hover:text-orange-300 font-medium">Terms of Service</button>
                      {' '}and{' '}
                      <button type="button" className="text-orange-400 hover:text-orange-300 font-medium">Privacy Policy</button>
                    </span>
                  </label>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={goBack}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-white/25 text-sm transition-all">
                      <ArrowLeft size={15} /> Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-lg shadow-orange-900/40">
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                          </svg>
                          Creating…
                        </>
                      ) : (
                        <>Let's go <ArrowRight size={15} /></>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-zinc-600 text-xs mt-6">© {new Date().getFullYear()} Alice · African Fashion Boutique</p>
      </div>

      {/* ── Keyframe animations ────────────────────────────────────────────── */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
