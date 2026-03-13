import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth, UserDB, OTPStore } from '../context/AuthContext';

const GOOGLE_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OTPInput({ value, onChange, length = 6 }) {
  const inputs = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const newVal = digits.map((d, idx) => idx === i ? '' : d).join('');
      onChange(newVal);
      if (i > 0) inputs.current[i - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const newVal = digits.map((d, idx) => idx === i ? e.key : d).join('');
      onChange(newVal);
      if (i < length - 1) inputs.current[i + 1]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center my-4">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onKeyDown={(e) => handleKey(e, i)}
          onChange={() => {}}
          onClick={() => inputs.current[i]?.focus()}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
            ${d ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-gray-50 text-gray-400'}
            focus:border-brand-500 focus:bg-white`}
        />
      ))}
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function Countdown({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft(l => {
      if (l <= 1) { clearInterval(t); onDone(); return 0; }
      return l - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  return <span className="font-mono text-brand-600 font-bold">{left}s</span>;
}

export default function AuthPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup | forgot | otp-verify | otp-forgot
  const [method, setMethod] = useState('email'); // email | phone
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [sentOtp, setSentOtp] = useState(''); // for demo display

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', newPassword: '',
  });

  useEffect(() => { if (user) router.push('/'); }, [user]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const simulateSendOtp = (target) => {
    const key = target;
    const generated = OTPStore.generate(key);
    setSentOtp(generated); // In real app, this would be sent via SMS/email
    return generated;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const googleUser = {
        id: 'google_' + Date.now(),
        name: 'Google User',
        email: 'user@gmail.com',
        avatar: 'G',
        provider: 'google',
      };
      login(googleUser);
      router.push('/');
    }, 1000);
  };

  const handleLoginSubmit = () => {
    setError('');
    const identifier = method === 'email' ? form.email : form.phone;
    if (!identifier || !form.password) { setError('Please fill in all fields.'); return; }

    const found = method === 'email'
      ? UserDB.findByEmail(form.email)
      : UserDB.findByPhone(form.phone);

    if (!found) { setError('No account found. Please sign up first.'); return; }
    if (found.password !== form.password) { setError('Incorrect password.'); return; }

    setLoading(true);
    setTimeout(() => {
      login(found);
      router.push('/');
    }, 800);
  };

  const handleSignupStep1 = () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (method === 'email') {
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) { setError('Enter a valid email.'); return; }
      if (UserDB.findByEmail(form.email)) { setError('Email already registered.'); return; }
    } else {
      if (!form.phone || form.phone.length < 10) { setError('Enter a valid phone number.'); return; }
      if (UserDB.findByPhone(form.phone)) { setError('Phone already registered.'); return; }
    }
    if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }

    const key = method === 'email' ? form.email : form.phone;
    const generated = simulateSendOtp(key);
    setSuccess(`OTP sent to your ${method === 'email' ? 'email' : 'phone'}! (Demo: ${generated})`);
    setCanResend(false);
    setStep(2);
    setOtp('');
  };

  const handleSignupVerify = () => {
    const key = method === 'email' ? form.email : form.phone;
    if (!OTPStore.verify(key, otp)) { setError('Invalid or expired OTP. Try again.'); return; }

    setLoading(true);
    setTimeout(() => {
      const newUser = UserDB.create({
        name: form.name,
        email: method === 'email' ? form.email : '',
        phone: method === 'phone' ? form.phone : '',
        password: form.password,
        avatar: form.name[0].toUpperCase(),
        provider: 'local',
      });
      login(newUser);
      router.push('/');
    }, 800);
  };

  const handleForgotStep1 = () => {
    const identifier = method === 'email' ? form.email : form.phone;
    if (!identifier) { setError(`Enter your ${method === 'email' ? 'email' : 'phone number'}.`); return; }
    const found = method === 'email' ? UserDB.findByEmail(form.email) : UserDB.findByPhone(form.phone);
    if (!found) { setError('No account found with this ' + method + '.'); return; }

    const generated = simulateSendOtp(identifier);
    setSuccess(`OTP sent! (Demo: ${generated})`);
    setCanResend(false);
    setStep(2);
    setOtp('');
  };

  const handleForgotVerify = () => {
    const key = method === 'email' ? form.email : form.phone;
    if (!OTPStore.verify(key, otp)) { setError('Invalid or expired OTP.'); return; }
    setStep(3);
    setError('');
    setSuccess('');
  };

  const handleResetPassword = () => {
    if (!form.newPassword || form.newPassword.length < 6) { setError('Password must be at least 6 chars.'); return; }
    const found = method === 'email' ? UserDB.findByEmail(form.email) : UserDB.findByPhone(form.phone);
    if (found) {
      UserDB.update(found.id, { password: form.newPassword });
      setSuccess('Password reset! You can now log in.');
      setTimeout(() => { setMode('login'); setStep(1); setSuccess(''); }, 2000);
    }
  };

  const resendOtp = () => {
    const key = method === 'email' ? form.email : form.phone;
    const generated = simulateSendOtp(key);
    setCanResend(false);
    setSuccess(`New OTP sent! (Demo: ${generated})`);
    setError('');
  };

  const switchMode = (m) => { setMode(m); setStep(1); setError(''); setSuccess(''); setOtp(''); setSentOtp(''); };

  // ── UI Helpers ────────────────────────────────────────────────────────────
  const inputCls = "input-field";
  const modeTitle = { login: 'Welcome Back', signup: 'Create Account', forgot: 'Reset Password' };
  const modeSubtitle = {
    login: 'Sign in to access your AI toolkit',
    signup: 'Join 50,000+ AI enthusiasts',
    forgot: 'We\'ll help you get back in',
  };

  return (
    <Layout title="Login" description="Sign in to AIToolsHub">
      <div className="min-h-screen flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
          style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <span className="text-white font-bold text-xl">AITools<span className="text-purple-400">Hub</span></span>
            </Link>

            <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
              Your AI Universe<br/>
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Starts Here
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10">Access 75+ AI tools, create prompts, save favorites, and stay ahead of the AI curve.</p>

            <div className="space-y-4">
              {[
                { icon: '🤖', text: '75+ AI Tools in one directory' },
                { icon: '✨', text: 'AI Prompt Maker for every use case' },
                { icon: '🔖', text: 'Save & organize your favorite tools' },
                { icon: '📺', text: 'Curated video tutorials' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg flex-shrink-0">{icon}</div>
                  <span className="text-gray-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute bottom-1/4 -left-10 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c084fc, transparent)' }} />

          <p className="text-gray-600 text-sm relative z-10">© 2026 AIToolsHub · phatanrayyankhan9@gmail.com</p>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="font-bold text-lg">AITools<span className="gradient-text">Hub</span></span>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                {mode === 'forgot' ? (step === 3 ? 'New Password' : step === 2 ? 'Enter OTP' : modeTitle[mode]) : (mode === 'signup' && step === 2 ? 'Verify OTP' : modeTitle[mode])}
              </h1>
              <p className="text-gray-500">{modeSubtitle[mode]}</p>
            </div>

            {/* Auth Mode Tabs */}
            {step === 1 && (
              <div className="flex rounded-xl bg-gray-200 p-1 mb-6">
                {['login', 'signup'].map(m => (
                  <button key={m} onClick={() => switchMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
                  </button>
                ))}
              </div>
            )}

            {/* Method Toggle */}
            {(mode !== 'forgot' || step === 1) && step === 1 && (
              <div className="flex rounded-xl bg-white border border-gray-200 p-1 mb-5">
                {['email', 'phone'].map(m => (
                  <button key={m} onClick={() => { setMethod(m); setError(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${method === m ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {m === 'email' ? '📧 Email' : '📱 Phone'}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2"><span>❌</span><span>{error}</span></div>}
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-start gap-2"><span>✅</span><span>{success}</span></div>}

            {/* ── LOGIN ────────────────────────────────── */}
            {mode === 'login' && step === 1 && (
              <div className="space-y-4">
                {method === 'email'
                  ? <input type="email" placeholder="Email address" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
                  : <div className="flex gap-2"><span className="input-field w-20 text-center text-gray-600 bg-gray-50 flex-shrink-0">+91</span>
                      <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
                    </div>
                }
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => set('password', e.target.value)} className={inputCls + ' pr-12'} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">{showPass ? '🙈' : '👁️'}</button>
                </div>
                <div className="text-right">
                  <button onClick={() => switchMode('forgot')} className="text-brand-600 text-sm hover:underline font-medium">Forgot password?</button>
                </div>
                <button onClick={handleLoginSubmit} disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-70">
                  {loading ? '⏳ Signing in...' : '🔑 Sign In'}
                </button>

                <div className="relative flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-200" /><span className="text-gray-400 text-xs font-medium">OR</span><div className="flex-1 h-px bg-gray-200" />
                </div>

                <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all hover:border-gray-300 disabled:opacity-70">
                  {GOOGLE_ICON} Continue with Google
                </button>
              </div>
            )}

            {/* ── SIGNUP Step 1 ────────────────────────── */}
            {mode === 'signup' && step === 1 && (
              <div className="space-y-4">
                <input type="text" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
                {method === 'email'
                  ? <input type="email" placeholder="Email address" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
                  : <div className="flex gap-2"><span className="input-field w-20 text-center text-gray-600 bg-gray-50 flex-shrink-0">+91</span>
                      <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
                    </div>
                }
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={form.password} onChange={e => set('password', e.target.value)} className={inputCls + ' pr-12'} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">{showPass ? '🙈' : '👁️'}</button>
                </div>
                <input type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={inputCls} />
                <button onClick={handleSignupStep1} className="btn-primary w-full justify-center py-3.5 text-base">
                  📱 Send OTP →
                </button>

                <div className="relative flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-200" /><span className="text-gray-400 text-xs font-medium">OR</span><div className="flex-1 h-px bg-gray-200" />
                </div>

                <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all hover:border-gray-300">
                  {GOOGLE_ICON} Sign up with Google
                </button>
              </div>
            )}

            {/* ── SIGNUP Step 2 — OTP ──────────────────── */}
            {mode === 'signup' && step === 2 && (
              <div className="text-center">
                <div className="text-5xl mb-3">📬</div>
                <p className="text-gray-600 mb-1">We sent a 6-digit OTP to</p>
                <p className="font-bold text-gray-900 mb-1">{method === 'email' ? form.email : form.phone}</p>
                {sentOtp && <p className="text-xs text-gray-400 mb-2">(Demo mode — OTP: <span className="font-mono font-bold text-brand-600">{sentOtp}</span>)</p>}
                <OTPInput value={otp} onChange={setOtp} />
                <button onClick={handleSignupVerify} disabled={otp.length < 6 || loading}
                  className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-50">
                  {loading ? '⏳ Verifying...' : '✅ Verify & Create Account'}
                </button>
                <div className="mt-4 text-sm text-gray-500">
                  {canResend
                    ? <button onClick={resendOtp} className="text-brand-600 font-semibold hover:underline">Resend OTP</button>
                    : <span>Resend in <Countdown seconds={60} onDone={() => setCanResend(true)} /></span>
                  }
                </div>
                <button onClick={() => setStep(1)} className="mt-3 text-gray-500 text-sm hover:text-gray-700">← Change details</button>
              </div>
            )}

            {/* ── FORGOT Step 1 ────────────────────────── */}
            {mode === 'forgot' && step === 1 && (
              <div className="space-y-4">
                <div className="text-center text-5xl mb-4">🔐</div>
                {method === 'email'
                  ? <input type="email" placeholder="Your email address" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
                  : <div className="flex gap-2"><span className="input-field w-20 text-center text-gray-600 bg-gray-50 flex-shrink-0">+91</span>
                      <input type="tel" placeholder="Your phone number" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} />
                    </div>
                }
                <button onClick={handleForgotStep1} className="btn-primary w-full justify-center py-3.5">
                  📤 Send Reset OTP
                </button>
                <button onClick={() => switchMode('login')} className="w-full text-center text-gray-500 text-sm hover:text-gray-700">← Back to Login</button>
              </div>
            )}

            {/* ── FORGOT Step 2 — OTP ──────────────────── */}
            {mode === 'forgot' && step === 2 && (
              <div className="text-center">
                <div className="text-5xl mb-3">📬</div>
                <p className="text-gray-600 mb-1">OTP sent to {method === 'email' ? form.email : form.phone}</p>
                {sentOtp && <p className="text-xs text-gray-400 mb-2">(Demo — OTP: <span className="font-mono font-bold text-brand-600">{sentOtp}</span>)</p>}
                <OTPInput value={otp} onChange={setOtp} />
                <button onClick={handleForgotVerify} disabled={otp.length < 6}
                  className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-50">
                  ✅ Verify OTP
                </button>
                <div className="mt-4 text-sm text-gray-500">
                  {canResend
                    ? <button onClick={resendOtp} className="text-brand-600 font-semibold hover:underline">Resend OTP</button>
                    : <span>Resend in <Countdown seconds={60} onDone={() => setCanResend(true)} /></span>
                  }
                </div>
              </div>
            )}

            {/* ── FORGOT Step 3 — New Password ─────────── */}
            {mode === 'forgot' && step === 3 && (
              <div className="space-y-4">
                <div className="text-center text-5xl mb-4">🔑</div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="New password (min 6 chars)" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} className={inputCls + ' pr-12'} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{showPass ? '🙈' : '👁️'}</button>
                </div>
                <button onClick={handleResetPassword} className="btn-primary w-full justify-center py-3.5">
                  🔒 Reset Password
                </button>
              </div>
            )}

            {/* Footer Note */}
            <p className="text-center text-gray-400 text-xs mt-6">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-brand-600 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
