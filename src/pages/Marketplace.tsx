import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Search, Grid3X3, List, SlidersHorizontal, X, ShoppingCart, HelpCircle, ArrowRight } from 'lucide-react';
import { categories } from '@/data/notes';
import { getAllNotes } from '@/lib/db';
import type { Note } from '@/types';
import { NoteCard } from '@/components/ui/NoteCard';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { useCartStore } from '@/store';
import { SEO } from '@/components/SEO';
import { StructuredData, getOrganizationSchema } from '@/components/StructuredData';
import { motion } from 'framer-motion';
import { ScalesOfJustice3D, LegalScroll3D, LaurelWreath } from '@/components/ui/LegalSVGs';
import { BadgeCheck, ShieldCheck, Trophy } from 'lucide-react';
import { AmbedkarJayantiPopup } from '@/components/ui/AmbedkarJayantiPopup';

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
    <>
    <AmbedkarJayantiPopup />
    <div className="pt-20 min-h-screen bg-[#FDFBF7]">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        canonical={selectedCategory ? `/category/${selectedCategory}` : '/marketplace'}
      />
      <StructuredData data={getOrganizationSchema()} />
      
      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-gold/10 bg-[#FDFBF7]">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[600px] h-full opacity-[0.03] pointer-events-none translate-x-1/4">
          <ScalesOfJustice3D className="w-full h-full" />
        </div>
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.02] pointer-events-none -translate-x-1/2 translate-y-1/2">
          <LegalScroll3D className="w-full h-full" />
        </div>

        <div className="section-container py-16 lg:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-3xl text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/5 border border-burgundy/10 rounded-full mb-6"
              >
                <BadgeCheck className="w-4 h-4 text-burgundy" />
                <span className="text-[10px] font-ui font-black uppercase tracking-widest text-burgundy">India's Most Trusted Legal Library</span>
              </motion.div>
              
              <h1 className="font-display text-4xl lg:text-6xl text-ink mb-6 leading-[1.1] font-bold">
                {categoryData ? (
                  <>The Premium <span className="text-gold italic block sm:inline">{categoryData.name}</span> Collection</>
                ) : (
                  <>Browse All <span className="text-gold italic block sm:inline">Legal Notes</span></>
                )}
              </h1>
              
              <p className="font-body text-ink/60 text-lg lg:text-xl max-w-2xl leading-relaxed">
                {categoryData 
                  ? `Master the complexities of ${categoryData.name.toLowerCase()} with our expertly-structured research materials and memory aides.`
                  : `Explore over ${allNotes.length} specialized legal modules. Each document is a masterpiece of legal research and clarity.`
                }
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold" />
                  <span className="text-xs font-ui font-bold text-ink/70">BCI Standards Compliant</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-ink/10" />
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold" />
                  <span className="text-xs font-ui font-bold text-ink/70">Used by 50,000+ Students</span>
                </div>
              </div>
            </div>

            {/* Quick Stats/Badge Column */}
            <div className="hidden xl:flex flex-col gap-4">
              <div className="p-6 bg-white border border-gold/10 rounded-[2rem] shadow-xl shadow-gold/5 flex flex-col items-center text-center max-w-[200px]">
                <LaurelWreath className="w-16 h-8 mb-2" />
                <div className="text-2xl font-display text-ink font-bold leading-none">4.9/5</div>
                <div className="text-[9px] font-ui font-black uppercase tracking-widest text-gold mt-1">Student Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div className="bg-white p-6 rounded-[2rem] border border-gold/10 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-4 bg-burgundy rounded-full" />
                  <h3 className="font-display text-[10px] font-black text-ink uppercase tracking-[0.2em]">Disciplines</h3>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-ui text-[11px] font-bold uppercase tracking-widest transition-all ${
                      !selectedCategory ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20' : 'text-ink/60 hover:bg-parchment'
                    }`}
                    aria-pressed={!selectedCategory ? "true" : "false"}
                  >
                    All Modules ({allNotes.length})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-ui text-[11px] font-bold uppercase tracking-widest transition-all ${
                        selectedCategory === category.slug 
                          ? 'bg-burgundy text-white shadow-lg shadow-burgundy/20' 
                          : 'text-ink/60 hover:bg-parchment'
                      }`}
                      aria-pressed={selectedCategory === category.slug ? "true" : "false"}
                    >
                      <span className="truncate pr-2">{category.name}</span>
                      <span className={`text-[9px] font-black tracking-tight shrink-0 ${selectedCategory === category.slug ? 'text-gold' : 'text-gold/60'}`}>{category.noteCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white p-6 rounded-[2rem] border border-gold/10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 -translate-y-1/2 translate-x-1/2 rounded-full group-hover:scale-150 transition-transform" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 bg-gold rounded-full" />
                  <h3 className="font-display text-[10px] font-black text-ink uppercase tracking-[0.2em]">Investment</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-display text-ink font-bold tracking-tight">₹199</span>
                  <span className="text-[10px] font-ui font-black text-gold uppercase tracking-widest">Starting Price</span>
                </div>
                <p className="text-[10px] font-ui font-medium text-ink/40 mt-3 leading-relaxed">
                  Unlock premium discounts when building subjects into a study bundle.
                </p>
                <Link to="/bundles" className="mt-4 flex items-center gap-2 text-[9px] font-black tracking-widest uppercase text-burgundy group/link hover:gap-3 transition-all">
                  Bundle & Save <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gold group-focus-within:scale-110 transition-transform" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for subjects, sections, or statutes..."
                  className="w-full pl-14 pr-6 py-5 bg-white rounded-3xl border border-gold/10 font-ui text-[13px] text-ink placeholder:text-ink/20 focus:outline-none focus:border-gold/30 focus:shadow-[0_0_40px_rgba(201,168,76,0.05)] transition-all"
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
                  className="relative p-5 bg-burgundy text-white rounded-3xl hover:bg-burgundy-light transition-all shadow-lg shadow-burgundy/20 active:scale-[0.98] group"
                  aria-label="Go to shopping cart"
                >
                  <ShoppingCart className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-gold text-ink text-[11px] font-black rounded-xl flex items-center justify-center ring-4 ring-[#FDFBF7]">
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
    </>
  );
}
