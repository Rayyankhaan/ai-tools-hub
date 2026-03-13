import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import ToolCard from '../components/ToolCard';
import { aiTools, blogPosts } from '../data/aiTools';
import { plans, testimonials, companies, faqs } from '../data/startup';
import { useAuth } from '../context/AuthContext';

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = end / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, end);
          setCount(Math.floor(current));
          if (current >= end) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${open ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-100 bg-white'}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
        <span className="font-bold text-gray-900 text-sm sm:text-base">{q}</span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${open ? 'bg-indigo-600 rotate-45' : 'bg-gray-100'}`}>
          <span className={`text-lg font-bold leading-none ${open ? 'text-white' : 'text-gray-500'}`}>+</span>
        </div>
      </button>
      {open && <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">{a}</div>}
    </div>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ plan, yearly }) {
  const price = yearly ? plan.price.yearly : plan.price.monthly;
  const isPopular = plan.id === 'pro';
  const router = useRouter();
  const { user } = useAuth();

  const handleCTA = () => {
    if (!user) { router.push('/login'); return; }
    if (plan.id === 'free') { router.push('/dashboard'); return; }
    alert(`🎉 Stripe integration ready! In production, this opens Stripe Checkout for the ${plan.name} plan ($${price}/mo).`);
  };

  return (
    <div className={`relative rounded-3xl p-8 flex flex-col gap-6 transition-all duration-300 ${isPopular ? 'plan-popular text-white scale-105' : 'card'}`}>
      {plan.badge && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${isPopular ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white' : 'bg-gray-900 text-white'}`}>
          {plan.badge}
        </div>
      )}

      <div>
        <div className="text-sm font-bold mb-1 opacity-70">{plan.name}</div>
        <div className="flex items-end gap-2">
          <div className="text-5xl font-black">${price}</div>
          <div className={`text-sm pb-2 ${isPopular ? 'text-indigo-300' : 'text-gray-400'}`}>
            {price === 0 ? 'forever' : '/month'}
          </div>
        </div>
        {yearly && price > 0 && (
          <div className="text-xs mt-1 text-green-400 font-semibold">Save ${(plan.price.monthly - price) * 12}/year</div>
        )}
        <p className={`text-sm mt-2 ${isPopular ? 'text-indigo-300' : 'text-gray-500'}`}>{plan.description}</p>
      </div>

      <ul className="space-y-3 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isPopular ? 'bg-indigo-500' : 'bg-indigo-100'}`}>
              <svg className={`w-3 h-3 ${isPopular ? 'text-white' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={isPopular ? 'text-indigo-100' : 'text-gray-700'}>{f}</span>
          </li>
        ))}
      </ul>

      <button onClick={handleCTA}
        className={`w-full py-4 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 ${
          isPopular
            ? 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg'
            : 'btn-primary'
        }`}>
        {plan.cta} →
      </button>
    </div>
  );
}

// ─── AdSense Component ───────────────────────────────────────────────────────
function AdBanner({ adSlot }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Adsense error:', e);
    }
  }, []);
  return (
    <ins className="adsbygoogle"
         style={{ display: 'block', margin: '20px 0' }}
         data-ad-client="ca-pub-6458731678804828"
         data-ad-slot={adSlot}
         data-ad-format="auto"
         data-full-width-responsive="true">
    </ins>
  );
}

// ─── Main Homepage ────────────────────────────────────────────────────────────
export default function Home() {
  const [search, setSearch] = useState('');
  const [yearly, setYearly] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) router.push(`/ai-tools?search=${encodeURIComponent(search)}`);
  };

  const featuredTools = aiTools.filter(t => t.featured).slice(0, 6);

  return (
    <Layout title="Home" description="The #1 AI tools directory with prompt maker, free utilities, and tutorials">

      {/* ══════════════════════════════════════════════════════ HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden mesh-dark noise pt-20">
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7, transparent)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl animate-float" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', animationDelay: '1s' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          {/* Launch badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 glass-dark border border-indigo-500/30 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-gray-300 font-semibold">75+ AI Tools · Updated Daily</span>
            <span className="text-indigo-400 text-xs font-bold px-2 py-0.5 bg-indigo-500/20 rounded-full">NEW</span>
          </div>

          {/* Hero headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tight animate-slide-up">
            Every AI Tool
            <span className="block font-serif italic mt-2" style={{
              background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 40%, #f9a8d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              In One Place
            </span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Discover, compare, and master every AI tool — plus generate perfect prompts with our AI Prompt Maker. <span className="text-white font-semibold">Trusted by 50,000+ creators.</span>
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8">
            <div className="flex-1 relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search ChatGPT, Midjourney, Cursor..."
                className="w-full pl-13 pr-5 py-4 rounded-2xl glass-dark border border-white/10 text-white placeholder:text-gray-500 text-base focus:outline-none focus:border-indigo-500 transition-all"
                style={{ paddingLeft: '3.25rem' }}
              />
            </div>
            <button type="submit" className="btn-primary px-8 py-4 text-base rounded-2xl">
              Search →
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href="/ai-tools" className="btn-primary px-8 py-4 text-base rounded-2xl">
              🤖 Browse AI Tools
            </Link>
            <Link href="/prompt-maker" className="btn-dark px-8 py-4 text-base rounded-2xl border border-white/10 hover:border-indigo-500/50">
              ✨ Try Prompt Maker
            </Link>
            {!user && (
              <Link href="/login" className="btn-ghost px-8 py-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl text-base">
                Sign up free →
              </Link>
            )}
          </div>

          {/* Trending chips */}
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <span className="text-gray-600 text-sm">Trending:</span>
            {['ChatGPT', 'Claude', 'Midjourney', 'Sora', 'Cursor', 'ElevenLabs', 'Gemini'].map(t => (
              <button key={t} onClick={() => router.push(`/ai-tools?search=${t}`)}
                className="px-3 py-1.5 glass-dark rounded-full text-xs text-gray-400 border border-white/10 hover:border-indigo-500/50 hover:text-white transition-all">
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ TICKER */}
      <section className="py-5 border-y border-gray-100 bg-white overflow-hidden">
        <div className="ticker-wrap">
          <div className="ticker-inner animate-ticker">
            {[...companies, ...companies].map((c, i) => (
              <div key={i} className="inline-flex items-center gap-2 px-8 text-gray-400 text-sm font-bold whitespace-nowrap">
                <span className="text-xl">{c.logo}</span>
                <span>{c.name}</span>
                <span className="text-gray-200 ml-4">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ STATS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'AI Tools Listed', end: 75, suffix: '+', desc: 'Across 17 categories' },
              { label: 'Monthly Users', end: 50000, suffix: '+', desc: 'Creators & developers' },
              { label: 'Prompts Generated', end: 1200000, suffix: '+', desc: 'And counting' },
              { label: 'Tools Added Monthly', end: 15, suffix: '+', desc: 'Always up to date' },
            ].map(({ label, end, suffix, desc }) => (
              <div key={label} className="text-center">
                <div className="stat-number mb-1"><Counter end={end} suffix={suffix} /></div>
                <div className="font-bold text-gray-900 text-sm mb-1">{label}</div>
                <div className="text-gray-400 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FEATURES */}
      <section className="py-24 mesh-gradient">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="chip mb-4">⚡ Why AIToolsHub</div>
            <h2 className="section-title">Everything you need<br />to win with AI</h2>
            <p className="section-subtitle max-w-xl mx-auto">One platform to discover tools, generate prompts, and level up your AI game.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🤖', title: '75+ AI Tools Directory', desc: 'Every major AI tool in one place — search, filter, compare. Always up to date with the latest releases.', color: '#6366f1' },
              { icon: '✨', title: 'AI Prompt Maker', desc: '8 prompt categories for image, video, coding, writing, audio, business and more. Generate perfect prompts in seconds.', color: '#8b5cf6' },
              { icon: '🛠️', title: '6 Free Utilities', desc: 'Password generator, QR code maker, word counter, image compressor, URL shortener, and color picker — no sign up needed.', color: '#10b981' },
              { icon: '📺', title: 'Video Tutorials', desc: 'Curated YouTube tutorials for every AI tool from beginner to advanced. Watch in-app without leaving the page.', color: '#ef4444' },
              { icon: '📰', title: 'AI News & Blog', desc: 'Stay current with the latest in AI. Tool reviews, comparisons, guides, and industry news — updated weekly.', color: '#f59e0b' },
              { icon: '🔖', title: 'Save & Organize', desc: 'Save your favorite prompts, bookmark tools, and build your personal AI toolkit. Cloud synced across devices.', color: '#0891b2' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="card p-7 group">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform" style={{ background: color + '18' }}>
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FEATURED TOOLS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="chip mb-3">🔥 Trending Now</div>
              <h2 className="section-title">Top AI Tools</h2>
              <p className="section-subtitle">Used by millions worldwide</p>
            </div>
            <Link href="/ai-tools" className="btn-secondary hidden sm:flex">View all 75+ →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/ai-tools" className="btn-primary px-10 py-4 text-base">Explore All 75+ AI Tools →</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ PROMPT MAKER CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a1f 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 70% 50%, #a855f7 0%, transparent 50%)',
        }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="chip bg-indigo-500/20 text-indigo-300 mb-5">✨ Prompt Maker</div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
                Generate perfect<br />
                <span className="font-serif italic" style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  AI prompts
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">Stop guessing what to type. Our Prompt Maker builds optimized prompts for Midjourney, ChatGPT, Sora, Cursor, and 50+ more AI tools.</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/prompt-maker" className="btn-primary px-8 py-4">✨ Try Prompt Maker →</Link>
                {!user && <Link href="/login" className="btn-ghost text-gray-400 hover:text-white px-6 py-4">Free to start</Link>}
              </div>
            </div>
            <div className="space-y-3">
              {['🎨 Image Prompt → Midjourney, DALL-E, Flux', '🎬 Video Prompt → Sora, Runway, Kling', '💬 Chat Prompt → ChatGPT, Claude, Gemini', '👨‍💻 Code Prompt → Cursor, Copilot, Bolt', '🎵 Audio Prompt → ElevenLabs, Suno, Udio', '📱 App Prompt → Bolt.new, v0, Framer'].map(item => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-2xl glass-dark border border-white/5 hover:border-indigo-500/30 transition-all">
                  <div className="text-lg">{item.split(' ')[0]}</div>
                  <span className="text-gray-300 text-sm">{item.slice(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="chip mb-4">💬 Testimonials</div>
            <h2 className="section-title">Loved by creators</h2>
            <div className="flex justify-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-xl">★</span>)}
              <span className="text-gray-500 text-sm ml-2 self-center">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-7">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <span key={j} className="text-amber-400">★</span>)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ PRICING */}
      <section id="pricing" className="py-24 mesh-gradient">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="chip mb-4">💳 Pricing</div>
            <h2 className="section-title">Simple, honest pricing</h2>
            <p className="section-subtitle">Start free. Upgrade when you need more.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm font-semibold ${!yearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
              <button onClick={() => setYearly(!yearly)}
                className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${yearly ? 'left-8' : 'left-1'}`} />
              </button>
              <span className={`text-sm font-semibold ${yearly ? 'text-gray-900' : 'text-gray-400'}`}>
                Yearly <span className="text-green-600 font-bold">Save 20%</span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {plans.map(plan => <PricingCard key={plan.id} plan={plan} yearly={yearly} />)}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">✅ 7-day money-back guarantee &nbsp;·&nbsp; No credit card required for free plan &nbsp;·&nbsp; Cancel anytime</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="chip mb-4">❓ FAQ</div>
            <h2 className="section-title">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ FINAL CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Start your AI journey<br />
            <span className="font-serif italic opacity-80">today. For free.</span>
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">Join 50,000+ creators already using AIToolsHub to discover tools, generate prompts, and stay ahead of the AI curve.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/login" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-black px-10 py-5 rounded-2xl hover:bg-indigo-50 transition-all hover:-translate-y-0.5 shadow-2xl text-lg">
              🎉 Get Started Free
            </Link>
            <Link href="#pricing" className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-bold px-10 py-5 rounded-2xl hover:bg-white/20 transition-all text-lg">
              View Pricing
            </Link>
          </div>
          <p className="text-indigo-300 text-sm mt-6">No credit card · 10 free prompts daily · Cancel anytime</p>
        </div>
      </section>
    </Layout>
  );
}
