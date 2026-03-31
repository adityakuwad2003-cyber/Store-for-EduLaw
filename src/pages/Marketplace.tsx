import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Grid3X3, List, SlidersHorizontal, X, ShoppingCart } from 'lucide-react';
import { categories } from '@/data/notes';
import { getAllNotes } from '@/lib/db';
import type { Note } from '@/types';
import { NoteCard } from '@/components/ui/NoteCard';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { useCartStore } from '@/store';

export function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getTotalItems } = useCartStore();

  const cartCount = getTotalItems();

  // Fetch from Firebase on mount
  useEffect(() => {
    getAllNotes().then((notes) => {
      setAllNotes(notes);
      setIsLoading(false);
    });
  }, []);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let notes = [...allNotes];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      notes = notes.filter(note =>
        note.title.toLowerCase().includes(q) ||
        note.category.toLowerCase().includes(q) ||
        note.subjectCode.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        notes = notes.filter(note => note.category === category.name);
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  }, [searchQuery, selectedCategory, sortBy, allNotes]);

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

  return (
    <div className="pt-20 min-h-screen bg-parchment">
      {/* Header */}
      <div className="bg-ink py-12">
        <div className="section-container">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-parchment mb-2">
              Browse All <span className="text-gold">Notes</span>
            </h1>
            <p className="font-body text-parchment/70">
              {isLoading ? 'Loading...' : `${allNotes.length}+ legal subjects crafted for law students`}
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
                <h3 className="font-display text-lg text-ink mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-ui text-sm transition-colors ${
                      !selectedCategory ? 'bg-burgundy text-parchment' : 'text-ink hover:bg-parchment-dark'
                    }`}
                  >
                    All Categories ({allNotes.length})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-ui text-sm transition-colors ${
                        selectedCategory === category.slug 
                          ? 'bg-burgundy text-parchment' 
                          : 'text-ink hover:bg-parchment-dark'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs opacity-70">{category.noteCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-display text-lg text-ink mb-4">Price</h3>
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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by subject, act, or topic..."
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-parchment-dark font-ui text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/10"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white rounded-xl border border-parchment-dark font-ui text-sm focus:outline-none focus:border-burgundy"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-3 bg-white rounded-xl border border-parchment-dark hover:border-burgundy transition-colors"
                >
                  {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-3 bg-white rounded-xl border border-parchment-dark hover:border-burgundy transition-colors"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>

                <Link
                  to="/cart"
                  className="relative p-3 bg-burgundy text-parchment rounded-xl hover:bg-burgundy-light transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-ink text-xs font-ui font-bold rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-4 bg-white rounded-xl border border-parchment-dark">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
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
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-mutedgray">Active filters:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-ui">
                    {categories.find(c => c.slug === selectedCategory)?.name}
                    <button onClick={() => handleCategorySelect(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-ui">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-burgundy hover:underline"
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
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                    <div className="h-40 bg-parchment-dark rounded-xl mb-4" />
                    <div className="h-5 bg-parchment-dark rounded w-3/4 mb-2" />
                    <div className="h-4 bg-parchment-dark rounded w-1/2" />
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
                <div className="w-16 h-16 bg-parchment-dark rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-mutedgray" />
                </div>
                <h3 className="font-display text-xl text-ink mb-2">No notes found</h3>
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

      {/* Floating Bundle Builder Button */}
      <Link
        to="/bundles"
        className="fixed bottom-6 right-6 px-6 py-3 bg-burgundy text-parchment rounded-full shadow-lg hover:bg-burgundy-light transition-colors font-ui font-medium flex items-center gap-2 z-40"
      >
        <ShoppingCart className="w-5 h-5" />
        Build Your Bundle
      </Link>
    </div>
  );
}
