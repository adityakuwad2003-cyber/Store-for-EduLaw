import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Search, Grid3X3, List, SlidersHorizontal, X, ShoppingCart, HelpCircle } from 'lucide-react';
import { categories } from '@/data/notes';
import { getAllNotes } from '@/lib/db';
import type { Note } from '@/types';
import { NoteCard } from '@/components/ui/NoteCard';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { useCartStore } from '@/store';
import { SEO } from '@/components/SEO';
import { StructuredData, getOrganizationSchema } from '@/components/StructuredData';

export function Marketplace() {
  const { categorySlug: routeCategorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Priority: URL Path (:categorySlug) > Search Params (?category=)
  const initialCategory = routeCategorySlug || searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getTotalItems } = useCartStore();

  const cartCount = getTotalItems();

  // Sync state if route changes
  useEffect(() => {
    if (routeCategorySlug) {
      setSelectedCategory(routeCategorySlug);
    }
  }, [routeCategorySlug]);

  // Fetch from Firebase on mount
  useEffect(() => {
    getAllNotes().then((notes) => {
      setAllNotes(notes);
      setIsLoading(false);
    });
  }, []);

  const categoryData = useMemo(() => 
    categories.find(c => c.slug === selectedCategory),
    [selectedCategory]
  );

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let notes = [...allNotes];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      notes = notes.filter(note =>
        note.title.toLowerCase().includes(q) ||
        note.category.toLowerCase().includes(q) ||
        ( note.subjectCode ?? '').toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      if (categoryData) {
        notes = notes.filter(note => note.category === categoryData.name);
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        notes.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
      case 'price-low':
        notes.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        notes.sort((a, b) => b.price - a.price);
        break;
      default:
        notes.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return notes;
  }, [searchQuery, selectedCategory, sortBy, allNotes, categoryData]);

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('popular');
    setSearchParams({});
  };

  const pageTitle = categoryData 
    ? `${categoryData.name} for Law Students India`
    : "Legal Study Materials, Notes & Courses India";
  
  const pageDescription = categoryData
    ? `Browse ${categoryData.name} resources from The EduLaw — India's top legal education brand. High-quality study materials designed for CLAT, LLB, and judiciary aspirants.`
    : "Shop India's most trusted legal notes and study materials. Expertly crafted resources for law students, judiciary exams, and legal practitioners.";

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        canonical={selectedCategory ? `/category/${selectedCategory}` : '/marketplace'}
      />
      <StructuredData data={getOrganizationSchema()} />
      
      {/* Header */}
      <div className="bg-slate-900 py-16">
        <div className="section-container text-center lg:text-left">
          <div className="max-w-3xl">
            <h1 className="font-display text-3xl lg:text-5xl text-white mb-4 leading-tight font-bold">
              {categoryData ? (
                <>Buy <span className="text-gold">{categoryData.name}</span> Online</>
              ) : (
                <>Browse All <span className="text-gold">Legal Notes</span></>
              )}
            </h1>
            <p className="font-body text-parchment/70 text-lg">
              {categoryData 
                ? `Prepare for CLAT, Judiciary, and LLB exams with our premium ${categoryData.name.toLowerCase()} resources. Expertly curated for performance and clarity.`
                : `${allNotes.length}+ comprehensive legal subjects crafted for law students and practitioners across India.`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-display text-lg text-slate-900 mb-6 font-bold uppercase tracking-widest text-[10px]">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-ui text-xs font-black uppercase tracking-widest transition-all ${
                      !selectedCategory ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                    aria-pressed={!selectedCategory ? "true" : "false"}
                  >
                    All Subjects ({allNotes.length})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-ui text-xs font-black uppercase tracking-widest transition-all ${
                        selectedCategory === category.slug 
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                      aria-pressed={selectedCategory === category.slug ? "true" : "false"}
                    >
                      <span>{category.name}</span>
                      <span className={`text-[10px] ${selectedCategory === category.slug ? 'text-gold' : 'text-slate-300'}`}>{category.noteCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-display text-lg text-slate-900 mb-4 font-bold uppercase tracking-widest text-[10px]">Pricing</h3>
                <div className="flex items-center gap-2">
                  <span className="font-ui text-sm text-mutedgray">All notes at</span>
                  <span className="font-display text-gold">₹199</span>
                </div>
                <p className="text-xs text-mutedgray mt-2">
                  Bundle discounts available
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-gold transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you studying today?"
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 font-ui text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all shadow-sm"
                  aria-label="Search Legal Notes"
                />
              </div>

              <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white text-slate-600 px-5 py-4 rounded-2xl font-ui text-xs font-black uppercase tracking-widest border border-slate-200 focus:ring-2 focus:ring-gold/20 outline-none cursor-pointer shadow-sm hover:border-slate-300 transition-all"
                    aria-label="Sort products by"
                  >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-gold/30 hover:bg-slate-50 transition-all text-slate-400 hover:text-gold shadow-sm"
                  aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-4 bg-white rounded-2xl border border-slate-200 hover:border-gold/30 hover:bg-slate-50 transition-all text-slate-400 hover:text-gold"
                  aria-label="Open filter menu"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>

                <Link
                  to="/cart"
                  className="relative p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                  aria-label="Go to shopping cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-slate-900 text-[10px] font-ui font-black rounded-lg flex items-center justify-center ring-2 ring-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg text-slate-900 font-bold">Refine Results</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400" aria-label="Close filters">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <CategoryBadge
                      key={category.id}
                      name={category.name}
                      slug={category.slug}
                      color={category.color}
                      isActive={selectedCategory === category.slug}
                      onClick={() => handleCategorySelect(
                        selectedCategory === category.slug ? null : category.slug
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(selectedCategory || searchQuery) && (
              <div className="flex items-center flex-wrap gap-3 mb-8">
                <span className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400">Active:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 text-gold rounded-full text-[10px] font-ui font-black uppercase tracking-widest border border-gold/20">
                    {categories.find(c => c.slug === selectedCategory)?.name}
                    <button onClick={() => handleCategorySelect(null)} aria-label="Clear category filter">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-900 rounded-full text-[10px] font-ui font-black uppercase tracking-widest border border-slate-200">
                    Query: {searchQuery}
                    <button onClick={() => setSearchQuery('')} aria-label="Clear search query">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-ui font-black uppercase tracking-[0.2em] text-slate-400 hover:text-gold transition-colors ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-mutedgray mb-6">
              {isLoading ? 'Loading notes...' : `Showing ${filteredNotes.length} of ${allNotes.length} notes`}
            </p>

            {/* Notes Grid */}
            {isLoading ? (
              <div className={`grid sm:grid-cols-2 xl:grid-cols-3 gap-6`}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col gap-4 animate-pulse">
                    <div className="h-6 bg-slate-100 rounded-lg w-1/4" />
                    <div className="h-8 bg-slate-100 rounded-lg w-full" />
                    <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
                    <div className="mt-auto h-12 bg-slate-50 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'sm:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              } gap-6`}>
                {filteredNotes.map((note, index) => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    index={index}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="font-display text-2xl text-slate-900 mb-2 font-bold focus:outline-none">No notes found</h3>
                <p className="text-mutedgray mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-burgundy text-parchment rounded-lg font-ui font-medium hover:bg-burgundy-light transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Content & FAQs */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl lg:text-4xl text-slate-900 mb-12 text-center font-bold">
              Legal Study <span className="text-gold">Insights & FAQ</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  q: "Are these notes suitable for CLAT 2025?",
                  a: "Yes, all our notes, especially the new criminal laws (BNS, BNSS, BSA), are updated for current and upcoming 2025 examinations."
                },
                {
                  q: "Can I download the notes after purchase?",
                  a: "Absolutely. Once the payment is successful, you can download the full PDF from your dashboard's 'My Library' section."
                },
                {
                  q: "Are these notes written by legal experts?",
                  a: "The EduLaw materials are drafted by a team of experienced lawyers and top-tier law students under strict academic supervision."
                },
                {
                  q: "Do you offer discounts on bulk orders?",
                  a: "We recommend using our 'Build Your Bundle' feature to save up to 40% when buying multiple subjects together."
                }
              ].map((faq, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="font-display text-lg text-slate-900 flex items-center gap-3 font-bold">
                    <HelpCircle className="w-5 h-5 text-gold shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="font-ui text-slate-500 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bundle Builder Button */}
      <Link
        to="/bundles"
        className="fixed bottom-8 right-8 px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl hover:bg-slate-800 transition-all font-ui font-black uppercase tracking-widest text-xs flex items-center gap-3 z-40 active:scale-95 group"
        aria-label="Build your note bundle"
      >
        <ShoppingCart className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
        Build Your Bundle
      </Link>
    </div>
  );
}
