import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

// ─── Prompt Templates Data ────────────────────────────────────────────────────
const promptCategories = [
  {
    id: 'image',
    label: 'Image Prompt',
    icon: '🎨',
    color: '#7c3aed',
    bg: 'from-purple-600 to-pink-600',
    desc: 'For Midjourney, DALL-E, Stable Diffusion, Flux',
    tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion', 'Adobe Firefly', 'Ideogram', 'Flux AI'],
    fields: [
      { key: 'subject', label: 'Subject / Main Idea', placeholder: 'e.g. A futuristic city at sunset', type: 'text', required: true },
      { key: 'style', label: 'Art Style', type: 'select', options: ['Photorealistic', 'Digital Art', 'Oil Painting', 'Watercolor', 'Anime / Manga', 'Comic Book', 'Cinematic', '3D Render', 'Pencil Sketch', 'Impressionism', 'Surrealism', 'Minimalist', 'Dark Fantasy', 'Cyberpunk', 'Studio Ghibli'] },
      { key: 'mood', label: 'Mood / Atmosphere', type: 'select', options: ['Epic', 'Serene', 'Mysterious', 'Dramatic', 'Cheerful', 'Dark', 'Ethereal', 'Gritty', 'Romantic', 'Futuristic', 'Vintage', 'Dreamy'] },
      { key: 'lighting', label: 'Lighting', type: 'select', options: ['Golden hour', 'Neon lights', 'Studio lighting', 'Dramatic shadows', 'Soft diffused', 'Moonlight', 'Sunrise', 'God rays', 'Rim lighting', 'Foggy', 'Bioluminescent'] },
      { key: 'camera', label: 'Camera / Composition', type: 'select', options: ['Portrait close-up', 'Wide angle', 'Aerial view', 'Low angle', 'Macro', 'Bokeh background', 'Rule of thirds', 'Symmetrical', 'Fisheye'] },
      { key: 'quality', label: 'Quality Tags', type: 'multicheck', options: ['8K ultra HD', 'Highly detailed', 'Masterpiece', 'Award winning', 'Trending on ArtStation', 'Professional photography', 'Sharp focus', 'Intricate details'] },
      { key: 'negative', label: 'Negative Prompt (what to avoid)', placeholder: 'e.g. blurry, text, watermark, low quality', type: 'text' },
    ],
  },
  {
    id: 'video',
    label: 'Video Prompt',
    icon: '🎬',
    color: '#dc2626',
    bg: 'from-red-600 to-orange-600',
    desc: 'For Sora, Runway, Kling, Luma, Pika',
    tools: ['Sora', 'Runway Gen-3', 'Kling AI', 'Luma Dream Machine', 'Pika Labs', 'HeyGen'],
    fields: [
      { key: 'scene', label: 'Scene Description', placeholder: 'e.g. A drone flying over a misty mountain range at dawn', type: 'text', required: true },
      { key: 'cameraMotion', label: 'Camera Movement', type: 'select', options: ['Static shot', 'Slow zoom in', 'Slow zoom out', 'Pan left', 'Pan right', 'Tilt up', 'Tilt down', 'Dolly forward', 'Orbit / Arc shot', 'Drone aerial', 'Handheld shaky', 'Tracking shot', 'Time lapse'] },
      { key: 'duration', label: 'Duration / Pacing', type: 'select', options: ['5 seconds, slow', '10 seconds, normal pace', '15 seconds, dynamic', '30 seconds, cinematic', 'Short loop', 'Slow motion 120fps'] },
      { key: 'videoStyle', label: 'Visual Style', type: 'select', options: ['Photorealistic 4K', 'Cinematic film', 'Anime', '3D animated', 'Documentary', 'Music video', 'Commercial ad', 'Nature documentary', 'Sci-fi film'] },
      { key: 'lighting2', label: 'Lighting / Time of Day', type: 'select', options: ['Golden hour sunrise', 'Blue hour sunset', 'Midday bright', 'Night neon city', 'Overcast moody', 'Storm lightning', 'Studio lit', 'Natural daylight'] },
      { key: 'sound', label: 'Sound / Audio Cue', placeholder: 'e.g. Epic orchestral music, birds chirping, silence', type: 'text' },
      { key: 'transition', label: 'Transition / Effect', type: 'select', options: ['Smooth cut', 'Fade in/out', 'Whip pan', 'Morph transition', 'Glitch effect', 'Slow motion reveal', 'Zoom blur', 'None'] },
    ],
  },
  {
    id: 'chatbot',
    label: 'ChatGPT / Claude Prompt',
    icon: '💬',
    color: '#10a37f',
    bg: 'from-emerald-600 to-teal-600',
    desc: 'For ChatGPT, Claude, Gemini, Grok, Perplexity',
    tools: ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Perplexity', 'Meta AI'],
    fields: [
      { key: 'role', label: 'AI Role / Persona', placeholder: 'e.g. You are an expert marketing consultant with 15 years experience', type: 'text', required: true },
      { key: 'task', label: 'Task / Goal', placeholder: 'e.g. Help me write a product launch email campaign', type: 'text', required: true },
      { key: 'context', label: 'Context / Background', placeholder: 'e.g. My product is a SaaS project management tool for small teams', type: 'textarea' },
      { key: 'tone', label: 'Tone of Voice', type: 'select', options: ['Professional', 'Casual & friendly', 'Academic', 'Persuasive', 'Humorous', 'Empathetic', 'Direct & concise', 'Storytelling', 'Technical'] },
      { key: 'format', label: 'Output Format', type: 'select', options: ['Detailed essay', 'Bullet points', 'Numbered list', 'Table', 'Step-by-step guide', 'Short summary', 'Code only', 'JSON format', 'Markdown'] },
      { key: 'length', label: 'Response Length', type: 'select', options: ['Very short (1-2 sentences)', 'Short (1 paragraph)', 'Medium (3-5 paragraphs)', 'Long (detailed)', 'As long as needed'] },
      { key: 'examples', label: 'Include Examples?', type: 'select', options: ['Yes, with examples', 'No examples needed', 'Only if necessary'] },
      { key: 'constraint', label: 'Constraints / What to Avoid', placeholder: 'e.g. Avoid jargon, do not mention competitors', type: 'text' },
    ],
  },
  {
    id: 'coding',
    label: 'Coding Prompt',
    icon: '👨‍💻',
    color: '#1d4ed8',
    bg: 'from-blue-700 to-indigo-700',
    desc: 'For Cursor, GitHub Copilot, Claude Code, Bolt.new, v0',
    tools: ['Cursor', 'GitHub Copilot', 'Claude Code', 'Bolt.new', 'v0 by Vercel', 'Replit AI'],
    fields: [
      { key: 'task', label: 'What to Build', placeholder: 'e.g. A React dashboard with charts showing sales data', type: 'text', required: true },
      { key: 'language', label: 'Language / Framework', type: 'select', options: ['JavaScript / React', 'TypeScript / Next.js', 'Python / FastAPI', 'Python / Django', 'Node.js / Express', 'Vue.js', 'Svelte', 'Flutter', 'Swift (iOS)', 'Kotlin (Android)', 'Go', 'Rust', 'PHP / Laravel', 'Ruby on Rails'] },
      { key: 'codeStyle', label: 'Code Style', type: 'select', options: ['Clean, production-ready', 'Beginner-friendly with comments', 'Minimal, no comments', 'With full error handling', 'With unit tests', 'With TypeScript types'] },
      { key: 'features', label: 'Key Features to Include', placeholder: 'e.g. Auth, dark mode, responsive, real-time updates', type: 'textarea' },
      { key: 'styling', label: 'Styling Approach', type: 'select', options: ['Tailwind CSS', 'CSS Modules', 'Styled Components', 'Material UI', 'Shadcn/ui', 'Plain CSS', 'Bootstrap', 'No styling needed'] },
      { key: 'database', label: 'Database / Backend', type: 'select', options: ['None needed', 'Supabase', 'Firebase', 'PostgreSQL + Prisma', 'MongoDB', 'SQLite', 'REST API', 'GraphQL', 'Local storage only'] },
      { key: 'codeExtra', label: 'Special Instructions', placeholder: 'e.g. Use hooks, avoid class components, mobile-first', type: 'text' },
    ],
  },
  {
    id: 'writing',
    label: 'Writing / Content Prompt',
    icon: '✍️',
    color: '#d97706',
    bg: 'from-amber-600 to-orange-600',
    desc: 'For Jasper, Copy.ai, Grammarly, Notion AI, Writesonic',
    tools: ['Jasper AI', 'Copy.ai', 'Writesonic', 'Notion AI', 'Grammarly', 'QuillBot'],
    fields: [
      { key: 'contentType', label: 'Content Type', type: 'select', options: ['Blog post / Article', 'Social media post', 'Email newsletter', 'Product description', 'Ad copy', 'YouTube script', 'LinkedIn post', 'Instagram caption', 'Press release', 'Case study', 'Whitepaper', 'Landing page copy'], required: true },
      { key: 'topic', label: 'Topic / Subject', placeholder: 'e.g. 10 tips to improve productivity with AI tools', type: 'text', required: true },
      { key: 'audience', label: 'Target Audience', placeholder: 'e.g. Startup founders, 25-40, tech-savvy', type: 'text' },
      { key: 'writingTone', label: 'Tone', type: 'select', options: ['Informative', 'Persuasive', 'Conversational', 'Professional', 'Witty', 'Inspiring', 'Educational', 'Storytelling'] },
      { key: 'wordCount', label: 'Word Count', type: 'select', options: ['~100 words', '~300 words', '~500 words', '~800 words', '~1200 words', '~2000 words', '3000+ words'] },
      { key: 'seo', label: 'SEO Keywords', placeholder: 'e.g. AI tools, best AI tools 2026, productivity AI', type: 'text' },
      { key: 'cta', label: 'Call to Action', placeholder: 'e.g. Sign up for free, Buy now, Learn more', type: 'text' },
    ],
  },
  {
    id: 'audio',
    label: 'Voice / Music Prompt',
    icon: '🎵',
    color: '#ec4899',
    bg: 'from-pink-600 to-rose-600',
    desc: 'For ElevenLabs, Suno, Udio, Mubert',
    tools: ['ElevenLabs', 'Suno AI', 'Udio', 'Mubert', 'Descript'],
    fields: [
      { key: 'audioType', label: 'Audio Type', type: 'select', options: ['Voice narration / TTS', 'Full song with lyrics', 'Instrumental background music', 'Sound effect', 'Podcast intro', 'Ad jingle'], required: true },
      { key: 'genre', label: 'Genre / Style', type: 'select', options: ['Pop', 'Hip-hop / Rap', 'EDM / Electronic', 'Lo-fi chill', 'Classical', 'Jazz', 'Rock', 'Ambient / Meditation', 'Cinematic / Epic', 'Country', 'R&B / Soul', 'Podcast friendly', 'Corporate / Professional'] },
      { key: 'voiceType', label: 'Voice Type (for TTS)', type: 'select', options: ['Deep male narrator', 'Warm female narrator', 'Young energetic', 'British accent', 'American accent', 'Calm & soothing', 'Excited & enthusiastic', 'Authoritative'] },
      { key: 'mood2', label: 'Mood / Emotion', type: 'select', options: ['Happy & uplifting', 'Melancholic', 'Epic & powerful', 'Relaxing', 'Mysterious', 'Romantic', 'Motivational', 'Suspenseful'] },
      { key: 'duration2', label: 'Duration', type: 'select', options: ['15 seconds', '30 seconds', '1 minute', '2-3 minutes', '3-5 minutes', 'Full song 3-4 min'] },
      { key: 'lyrics', label: 'Lyrics / Script', placeholder: 'Paste your lyrics or script here, or describe what it should say...', type: 'textarea' },
      { key: 'instruments', label: 'Instruments', placeholder: 'e.g. piano, strings, drums, no vocals', type: 'text' },
    ],
  },
  {
    id: 'business',
    label: 'Business / Marketing Prompt',
    icon: '📊',
    color: '#0891b2',
    bg: 'from-cyan-600 to-blue-600',
    desc: 'For HubSpot AI, Jasper, Copy.ai, Semrush',
    tools: ['HubSpot AI', 'Jasper AI', 'Copy.ai', 'Semrush AI', 'Zapier AI'],
    fields: [
      { key: 'bizTask', label: 'Business Task', type: 'select', options: ['Marketing strategy', 'Sales email sequence', 'Social media strategy', 'Business plan outline', 'Competitor analysis', 'Customer persona', 'SWOT analysis', 'Pitch deck content', 'Product roadmap', 'OKR goals'], required: true },
      { key: 'industry', label: 'Industry / Niche', placeholder: 'e.g. SaaS, E-commerce, Healthcare, Education', type: 'text' },
      { key: 'company', label: 'Company / Product', placeholder: 'e.g. Our app helps freelancers track invoices', type: 'text' },
      { key: 'goal', label: 'Primary Goal', type: 'select', options: ['Increase sales', 'Generate leads', 'Build brand awareness', 'Improve retention', 'Enter new market', 'Launch product', 'Reduce churn'] },
      { key: 'budget', label: 'Budget Range', type: 'select', options: ['Bootstrap / $0', '$1K-$5K/month', '$5K-$20K/month', '$20K+/month', 'Not specified'] },
      { key: 'timeline', label: 'Timeline', type: 'select', options: ['Immediate / ASAP', '1 month', '3 months', '6 months', '1 year', 'Long-term ongoing'] },
      { key: 'kpi', label: 'KPIs / Success Metrics', placeholder: 'e.g. 1000 signups, 20% conversion, $10K MRR', type: 'text' },
    ],
  },
  {
    id: 'app',
    label: 'App / Product Prompt',
    icon: '📱',
    color: '#059669',
    bg: 'from-emerald-600 to-green-600',
    desc: 'For Bolt.new, Replit, Framer, v0, Lovable',
    tools: ['Bolt.new', 'Replit AI', 'Framer AI', 'v0 by Vercel', 'Lovable', 'Claude Code'],
    fields: [
      { key: 'appIdea', label: 'App Idea / Name', placeholder: 'e.g. A habit tracker app called "StreakAI"', type: 'text', required: true },
      { key: 'appType', label: 'App Type', type: 'select', options: ['Web App (browser)', 'Mobile App (iOS/Android)', 'Chrome Extension', 'Desktop App', 'SaaS Platform', 'Landing Page', 'E-commerce Store', 'Portfolio Website', 'Dashboard / Analytics', 'API / Backend only'] },
      { key: 'targetUser', label: 'Target User', placeholder: 'e.g. Busy professionals who want to build habits', type: 'text' },
      { key: 'coreFeatures', label: 'Core Features (3-5)', placeholder: 'e.g. 1. Daily habit check-in 2. Streak tracking 3. AI motivation messages 4. Progress charts', type: 'textarea' },
      { key: 'design', label: 'Design Style', type: 'select', options: ['Clean & minimal', 'Dark mode', 'Colorful & playful', 'Corporate / Professional', 'Brutalist', 'Glass morphism', 'Neomorphism'] },
      { key: 'monetization', label: 'Monetization', type: 'select', options: ['Free', 'Freemium (free + paid)', 'One-time purchase', 'Monthly subscription', 'Usage-based', 'Ad-supported'] },
      { key: 'techStack', label: 'Tech Stack', type: 'select', options: ['Next.js + Tailwind', 'React + Firebase', 'Vue + Supabase', 'Flutter (mobile)', 'React Native', 'No code preferred', 'Let AI decide'] },
      { key: 'inspiration', label: 'Inspired By / Similar To', placeholder: 'e.g. Like Notion but simpler, like Duolingo for habits', type: 'text' },
    ],
  },
];

// ─── Field Renderers ──────────────────────────────────────────────────────────
function FieldRenderer({ field, value, onChange }) {
  if (field.type === 'text') {
    return (
      <input
        type="text"
        placeholder={field.placeholder}
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        className="input-field"
      />
    );
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        placeholder={field.placeholder}
        value={value || ''}
        onChange={e => onChange(field.key, e.target.value)}
        rows={3}
        className="input-field resize-none"
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select value={value || ''} onChange={e => onChange(field.key, e.target.value)} className="input-field">
        <option value="">— Select —</option>
        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (field.type === 'multicheck') {
    const selected = value ? value.split(', ').filter(Boolean) : [];
    const toggle = (opt) => {
      const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
      onChange(field.key, next.join(', '));
    };
    return (
      <div className="flex flex-wrap gap-2">
        {field.options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
              selected.includes(opt)
                ? 'bg-brand-600 border-brand-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────
function buildPrompt(category, values) {
  const v = values;
  switch (category.id) {
    case 'image': {
      const parts = [];
      if (v.subject) parts.push(v.subject);
      if (v.style) parts.push(`${v.style} style`);
      if (v.mood) parts.push(`${v.mood} mood`);
      if (v.lighting) parts.push(`${v.lighting} lighting`);
      if (v.camera) parts.push(`${v.camera} composition`);
      if (v.quality) parts.push(v.quality);
      let prompt = parts.join(', ');
      if (v.negative) prompt += `\n\nNegative prompt: ${v.negative}`;
      return prompt;
    }
    case 'video': {
      const parts = [];
      if (v.scene) parts.push(v.scene);
      if (v.cameraMotion) parts.push(`Camera: ${v.cameraMotion}`);
      if (v.videoStyle) parts.push(`Style: ${v.videoStyle}`);
      if (v.lighting2) parts.push(`Lighting: ${v.lighting2}`);
      if (v.duration) parts.push(`Duration: ${v.duration}`);
      if (v.transition) parts.push(`Transition: ${v.transition}`);
      if (v.sound) parts.push(`Audio: ${v.sound}`);
      return parts.join('. ');
    }
    case 'chatbot': {
      let prompt = '';
      if (v.role) prompt += `${v.role}.\n\n`;
      if (v.task) prompt += `Task: ${v.task}\n\n`;
      if (v.context) prompt += `Context: ${v.context}\n\n`;
      if (v.tone) prompt += `Tone: ${v.tone}. `;
      if (v.format) prompt += `Format your response as: ${v.format}. `;
      if (v.length) prompt += `Length: ${v.length}. `;
      if (v.examples) prompt += `Examples: ${v.examples}. `;
      if (v.constraint) prompt += `\n\nImportant constraints: ${v.constraint}`;
      return prompt.trim();
    }
    case 'coding': {
      let prompt = '';
      if (v.task) prompt += `Build: ${v.task}\n\n`;
      if (v.language) prompt += `Stack: ${v.language}\n`;
      if (v.styling) prompt += `Styling: ${v.styling}\n`;
      if (v.database) prompt += `Backend/DB: ${v.database}\n`;
      if (v.features) prompt += `\nFeatures:\n${v.features}\n`;
      if (v.codeStyle) prompt += `\nCode style: ${v.codeStyle}\n`;
      if (v.codeExtra) prompt += `\nExtra requirements: ${v.codeExtra}`;
      return prompt.trim();
    }
    case 'writing': {
      let prompt = '';
      if (v.contentType) prompt += `Write a ${v.contentType}`;
      if (v.topic) prompt += ` about: "${v.topic}"\n\n`;
      if (v.audience) prompt += `Target audience: ${v.audience}\n`;
      if (v.writingTone) prompt += `Tone: ${v.writingTone}\n`;
      if (v.wordCount) prompt += `Length: ${v.wordCount}\n`;
      if (v.seo) prompt += `SEO keywords to include: ${v.seo}\n`;
      if (v.cta) prompt += `End with a CTA: ${v.cta}`;
      return prompt.trim();
    }
    case 'audio': {
      let prompt = '';
      if (v.audioType) prompt += `Create: ${v.audioType}\n`;
      if (v.genre) prompt += `Genre/Style: ${v.genre}\n`;
      if (v.voiceType) prompt += `Voice: ${v.voiceType}\n`;
      if (v.mood2) prompt += `Mood: ${v.mood2}\n`;
      if (v.duration2) prompt += `Duration: ${v.duration2}\n`;
      if (v.instruments) prompt += `Instruments: ${v.instruments}\n`;
      if (v.lyrics) prompt += `\nLyrics/Script:\n${v.lyrics}`;
      return prompt.trim();
    }
    case 'business': {
      let prompt = '';
      if (v.bizTask) prompt += `Task: Create a ${v.bizTask}\n\n`;
      if (v.company) prompt += `About: ${v.company}\n`;
      if (v.industry) prompt += `Industry: ${v.industry}\n`;
      if (v.goal) prompt += `Primary goal: ${v.goal}\n`;
      if (v.budget) prompt += `Budget: ${v.budget}\n`;
      if (v.timeline) prompt += `Timeline: ${v.timeline}\n`;
      if (v.kpi) prompt += `Success metrics: ${v.kpi}`;
      return prompt.trim();
    }
    case 'app': {
      let prompt = '';
      if (v.appIdea) prompt += `App: ${v.appIdea}\n`;
      if (v.appType) prompt += `Type: ${v.appType}\n`;
      if (v.targetUser) prompt += `Target user: ${v.targetUser}\n`;
      if (v.design) prompt += `Design: ${v.design}\n`;
      if (v.monetization) prompt += `Monetization: ${v.monetization}\n`;
      if (v.techStack) prompt += `Stack: ${v.techStack}\n`;
      if (v.coreFeatures) prompt += `\nCore features:\n${v.coreFeatures}\n`;
      if (v.inspiration) prompt += `\nInspired by: ${v.inspiration}`;
      return prompt.trim();
    }
    default: return '';
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PromptMakerPage() {
  const { user, updateUser } = useAuth();
  const [activeCat, setActiveCat] = useState('image');
  const [values, setValues] = useState({});
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);

  const cat = promptCategories.find(c => c.id === activeCat);

  const setValue = (key, val) => {
    setValues(v => ({ ...v, [key]: val }));
    setGenerated('');
  };

  const generate = () => {
    const prompt = buildPrompt(cat, values);
    if (!prompt.trim()) { alert('Please fill in at least the required fields.'); return; }
    setGenerated(prompt);
    setSaved(false);
    // Add to local history
    const entry = { id: Date.now(), category: cat.label, icon: cat.icon, prompt, createdAt: new Date().toLocaleString() };
    setHistory(h => [entry, ...h].slice(0, 20));
  };

  const copy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savePrompt = () => {
    if (!user) { alert('Please log in to save prompts.'); return; }
    const savedPrompts = user.savedPrompts || [];
    const entry = { id: Date.now(), category: cat.label, icon: cat.icon, prompt: generated, createdAt: new Date().toLocaleString() };
    updateUser({ savedPrompts: [entry, ...savedPrompts] });
    setSaved(true);
  };

  const clearAll = () => { setValues({}); setGenerated(''); setSaved(false); };

  return (
    <Layout title="AI Prompt Maker" description="Generate perfect prompts for any AI tool">
      {/* Header */}
      <div className="relative py-14 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-purple-200 mb-5">
            ✨ AI-Powered Prompt Generator
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            AI Prompt Maker
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto mb-8">
            Generate perfect prompts for <strong className="text-white">any AI tool</strong> — image, video, code, writing, audio, business & more.
          </p>
          {/* Tool badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['Midjourney', 'ChatGPT', 'Sora', 'Cursor', 'ElevenLabs', 'Claude', 'Runway', 'Suno'].map(t => (
              <span key={t} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Selector */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Choose Prompt Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {promptCategories.map(c => (
              <button
                key={c.id}
                onClick={() => { setActiveCat(c.id); setValues({}); setGenerated(''); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  activeCat === c.id
                    ? 'border-transparent text-white shadow-lg scale-105'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                }`}
                style={activeCat === c.id ? { background: `linear-gradient(135deg, ${c.color}, ${c.color}99)` } : {}}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-semibold text-center leading-tight">{c.label.split(' ')[0]}{c.label.split(' ')[1] ? '\n' + c.label.split(' ').slice(1).join(' ') : ''}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Form ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Category Header */}
            <div className={`rounded-2xl p-5 text-white bg-gradient-to-r ${cat.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h2 className="font-bold text-xl">{cat.label}</h2>
                  <p className="text-white/70 text-sm">{cat.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {cat.tools.map(t => (
                  <span key={t} className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              {cat.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <FieldRenderer field={field} value={values[field.key]} onChange={setValue} />
                </div>
              ))}

              <div className="flex gap-3 pt-3">
                <button
                  onClick={generate}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-white text-base transition-all hover:-translate-y-0.5 hover:shadow-xl bg-gradient-to-r ${cat.bg}`}
                >
                  ✨ Generate Prompt
                </button>
                <button onClick={clearAll} className="px-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-all text-sm">
                  🗑️ Clear
                </button>
              </div>
            </div>
          </div>

          {/* ── Output Panel ── */}
          <div className="lg:col-span-1 space-y-5">
            {/* Generated Prompt */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Generated Prompt</h3>
                {generated && (
                  <div className="flex gap-2">
                    <button onClick={copy} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                    <button onClick={savePrompt} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${saved ? 'bg-purple-100 text-purple-700' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}>
                      {saved ? '✅ Saved' : '🔖 Save'}
                    </button>
                  </div>
                )}
              </div>

              {generated ? (
                <div className="bg-gray-950 rounded-xl p-4 font-mono text-sm text-green-300 leading-relaxed whitespace-pre-wrap break-words min-h-[150px] max-h-[400px] overflow-y-auto">
                  {generated}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200 min-h-[150px] flex flex-col items-center justify-center gap-3">
                  <div className="text-4xl">{cat.icon}</div>
                  <p className="text-gray-400 text-sm">Fill in the fields and click<br/><strong className="text-gray-600">Generate Prompt</strong></p>
                </div>
              )}

              {generated && (
                <div className="mt-3 text-xs text-gray-400 text-center">
                  {generated.length} characters · Copy and paste into your AI tool
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <h4 className="font-bold text-amber-800 mb-3 text-sm">💡 Pro Tips</h4>
              <ul className="space-y-2 text-amber-700 text-xs">
                {activeCat === 'image' && <>
                  <li>• Be specific — detail beats vague descriptions</li>
                  <li>• Add "--ar 16:9" for widescreen in Midjourney</li>
                  <li>• Use "–v 6" for Midjourney's latest model</li>
                  <li>• Negative prompts massively improve quality</li>
                </>}
                {activeCat === 'video' && <>
                  <li>• Keep Sora prompts under 150 words</li>
                  <li>• Describe the camera movement explicitly</li>
                  <li>• Runway works best with specific scene details</li>
                </>}
                {activeCat === 'chatbot' && <>
                  <li>• Start with "You are an expert..." for best results</li>
                  <li>• Add examples to show the format you want</li>
                  <li>• Be specific about output length and format</li>
                </>}
                {activeCat === 'coding' && <>
                  <li>• Include your exact stack and versions</li>
                  <li>• Ask for error handling explicitly</li>
                  <li>• Request mobile-responsive if needed</li>
                </>}
                {activeCat === 'writing' && <>
                  <li>• Define your audience as precisely as possible</li>
                  <li>• Include 2-3 target SEO keywords</li>
                  <li>• Ask for H2 subheadings for blog posts</li>
                </>}
                {!['image','video','chatbot','coding','writing'].includes(activeCat) && <>
                  <li>• Be as specific as possible for best results</li>
                  <li>• Fill required fields first</li>
                  <li>• Iterate — generate multiple times!</li>
                </>}
              </ul>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="font-bold text-gray-800 mb-3 text-sm">🕐 Recent Prompts</h4>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {history.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setGenerated(item.prompt)}
                      className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-100"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-xs font-semibold text-gray-600">{item.category}</span>
                        <span className="text-xs text-gray-400 ml-auto">{item.createdAt.split(',')[0]}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
