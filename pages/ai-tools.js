import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ToolCard from '../components/ToolCard';
import { aiTools, categories } from '../data/aiTools';

export default function AIToolsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  useEffect(() => {
    if (router.query.search) setSearch(router.query.search);
    if (router.query.category) setActiveCategory(router.query.category);
  }, [router.query]);

  const filtered = useMemo(() => {
    let result = [...aiTools];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)) || t.category.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'All') {
      result = result.filter((t) => t.category === activeCategory);
    }

    if (showFreeOnly) {
      result = result.filter((t) => t.free);
    }

    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return result;
  }, [search, activeCategory, sortBy, showFreeOnly]);

  return (
    <Layout title="AI Tools Directory" description="Browse 75+ AI tools across all categories">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-purple-900 py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-5">
            🤖 <span>{aiTools.length} Tools Listed</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">AI Tools Directory</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Every major AI tool in one place. Search, filter, and discover the perfect AI for your needs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools by name, category, or use case..."
                className="input-field pl-12"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-full md:w-48"
            >
              <option value="featured">⭐ Featured First</option>
              <option value="rating">🏆 Top Rated</option>
              <option value="name">🔤 Alphabetical</option>
            </select>

            {/* Free Toggle */}
            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all whitespace-nowrap ${
                showFreeOnly
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-400'
              }`}
            >
              {showFreeOnly ? '✅ Free Only' : '🆓 Free Only'}
            </button>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-400">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> tools
            {activeCategory !== 'All' && <span> in <span className="text-brand-600 font-medium">{activeCategory}</span></span>}
            {search && <span> for "<span className="text-brand-600 font-medium">{search}</span>"</span>}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const count = cat === 'All' ? aiTools.length : aiTools.filter((t) => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {cat} {count > 0 && <span className={`ml-1 text-xs ${activeCategory === cat ? 'text-blue-200' : 'text-gray-400'}`}>({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tools found</h3>
            <p className="text-gray-400">Try a different search term or category</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="mt-5 btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
