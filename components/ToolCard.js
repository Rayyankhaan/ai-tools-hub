export default function ToolCard({ tool }) {
  const categoryColors = {
    'Chatbot': 'bg-blue-50 text-blue-700',
    'Image Generation': 'bg-purple-50 text-purple-700',
    'Video Generation': 'bg-red-50 text-red-700',
    'Writing': 'bg-green-50 text-green-700',
    'Coding': 'bg-gray-100 text-gray-700',
    'Audio': 'bg-yellow-50 text-yellow-700',
    'Productivity': 'bg-orange-50 text-orange-700',
    'Research': 'bg-teal-50 text-teal-700',
    'Education': 'bg-emerald-50 text-emerald-700',
    'SEO': 'bg-cyan-50 text-cyan-700',
    'Marketing': 'bg-rose-50 text-rose-700',
    'Design': 'bg-pink-50 text-pink-700',
    'AI Agent': 'bg-violet-50 text-violet-700',
    'AI Platform': 'bg-indigo-50 text-indigo-700',
    'Translation': 'bg-sky-50 text-sky-700',
    'Image Editing': 'bg-fuchsia-50 text-fuchsia-700',
    'Search AI': 'bg-lime-50 text-lime-700',
  };

  const catClass = categoryColors[tool.category] || 'bg-gray-100 text-gray-700';

  return (
    <div className="tool-card card p-5 flex flex-col gap-4 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="tool-icon w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm"
            style={{ backgroundColor: tool.color + '15', border: `1px solid ${tool.color}30` }}
          >
            {tool.logo}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
              {tool.name}
            </h3>
            <span className={`badge text-xs ${catClass}`}>
              {tool.category}
            </span>
          </div>
        </div>
        {tool.free && (
          <span className="badge bg-green-50 text-green-700 text-xs border border-green-200">
            Free
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-2">
        {tool.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          ⭐ <span className="font-medium text-gray-600">{tool.rating}</span>
        </span>
        <span>•</span>
        <span>👥 {tool.users}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tool.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs">
            #{tag}
          </span>
        ))}
      </div>

      {/* Button */}
      <a
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-brand-100 text-brand-600 text-sm font-semibold hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all duration-200"
      >
        Visit Tool
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
