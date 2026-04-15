import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ShoppingCart, Tag, Zap, ChevronDown, ChevronUp, X } from 'lucide-react';
import { bundles } from '@/data/notes';
import { getAllNotes } from '@/lib/db';
import { SEO } from '@/components/SEO';
import type { Note } from '@/types';
import { BundleCard } from '@/components/ui/BundleCard';
import { useCartStore } from '@/store';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

function DiscountTierBar({ count }: { count: number }) {
  const tier1 = count >= 2;
  const tier2 = count >= 10;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-ui font-bold transition-all ${tier1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
        <Tag className="w-3 h-3" />
        2+ notes = 15% off
        {tier1 && !tier2 && <Check className="w-3 h-3" />}
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-ui font-bold transition-all ${tier2 ? 'bg-gold/20 text-[#8B6914]' : 'bg-slate-100 text-slate-400'}`}>
        <Zap className="w-3 h-3" />
        10+ notes = 20% off
        {tier2 && <Check className="w-3 h-3" />}
      </div>
    </div>
  );
}

export function Bundles() {
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [showPrebuilt, setShowPrebuilt] = useState(true);
  const { addBundle, addNote } = useCartStore();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get('preselect');

  useEffect(() => {
    getAllNotes().then((notes) => {
      setAllNotes(notes);
      setLoading(false);
    });
  }, []);

  // Pre-select note when coming from a note detail page
  useEffect(() => {
    if (preselectId && allNotes.length > 0) {
      setSelectedNoteIds(prev =>
        prev.includes(preselectId) ? prev : [preselectId, ...prev]
      );
    }
  }, [preselectId, allNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchFilter.trim()) return allNotes;
    const q = searchFilter.toLowerCase();
    return allNotes.filter(n =>
      n.title.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
    );
  }, [allNotes, searchFilter]);

  const { originalPrice, bundlePrice, savings, discountPct } = useMemo(() => {
    const count = selectedNoteIds.length;
    const original = selectedNoteIds.reduce((sum, id) => {
      const note = allNotes.find(n => String(n.id) === id);
      return sum + (note ? note.price : 199);
    }, 0);

    let price = original;
    let pct = 0;
    if (count >= 10) { price = Math.round(original * 0.80); pct = 20; }
    else if (count >= 2) { price = Math.round(original * 0.85); pct = 15; }

    return { originalPrice: original, bundlePrice: price, savings: original - price, discountPct: pct };
  }, [selectedNoteIds, allNotes]);

  const toggleNote = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  const handleAddCustomBundle = () => {
    if (selectedNoteIds.length === 0) {
      toast.error('Select at least 1 note to add to cart');
      return;
    }
    // Single note — add as individual purchase (no bundle needed)
    if (selectedNoteIds.length === 1) {
      const note = allNotes.find(n => String(n.id) === selectedNoteIds[0]);
      if (note) {
        addNote(note);
        toast.success(`${note.title} added to cart!`);
        setSelectedNoteIds([]);
      }
      return;
    }
    const customBundle = {
      id: `custom-${Date.now()}`,
      name: `My Bundle (${selectedNoteIds.length} notes)`,
      slug: 'custom-bundle',
      description: `Your custom selection of ${selectedNoteIds.length} subjects`,
      noteIds: selectedNoteIds,
      price: bundlePrice,
      originalPrice,
      isActive: true,
      savingsPercent: discountPct,
    };
    addBundle(customBundle);
    toast.success(`Bundle added to cart — you saved ₹${savings}!`);
    setSelectedNoteIds([]);
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50">
      <SEO 
        title="Premium Legal Note Bundles — Save Up to 60%"
        description="Get massive discounts with our curated legal note bundles. Judiciary prep packs, corporate law bundles, and complete NLU semester essentials."
        canonical="/bundles"
      />
      {/* Hero */}
      <div className="bg-ink py-12 sm:py-16">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1 px-4 py-2 bg-gold/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm text-gold">Save Up to 20%</span>
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-parchment mb-3">
              Build Your Bundle,{' '}
              <span className="text-gold">Save Big</span>
            </h1>
            <p className="font-body text-base sm:text-lg text-parchment/70">
              Pick any notes you want. Get 15% off for 2+ notes and 20% off for 10+ notes — automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-8 sm:py-12">

        {/* ── CUSTOM BUNDLE BUILDER ── always open & prominent */}
        <div className="bg-white rounded-2xl shadow-xl border border-gold/20 overflow-hidden mb-10">
          {/* Builder Header */}
          <div className="bg-gradient-to-r from-burgundy to-burgundy-light p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <h2 className="font-display text-xl sm:text-2xl text-parchment">Bundle Builder</h2>
                  <span className="px-2 py-0.5 bg-gold text-ink text-[10px] font-ui font-black uppercase tracking-wider rounded">
                    USP
                  </span>
                </div>
                <p className="text-parchment/70 text-sm font-ui">Select any notes — discount applies automatically</p>
              </div>
              {selectedNoteIds.length > 0 && (
                <button
                  onClick={() => setSelectedNoteIds([])}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-parchment/70 text-xs font-ui transition-colors"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            {/* Discount tiers */}
            <div className="mt-4">
              <DiscountTierBar count={selectedNoteIds.length} />
            </div>
          </div>

          {/* Live price summary — sticky on mobile */}
          <AnimatePresence>
            {selectedNoteIds.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-parchment border-b border-gold/20 overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-ui font-semibold text-ink text-sm">
                      {selectedNoteIds.length} note{selectedNoteIds.length > 1 ? 's' : ''} selected
                    </p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-display text-2xl text-gold font-bold">₹{bundlePrice}</span>
                      {savings > 0 && (
                        <>
                          <span className="text-sm text-slate-400 line-through">₹{originalPrice}</span>
                          <span className="text-xs font-ui font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Save ₹{savings} ({discountPct}% off)
                          </span>
                        </>
                      )}
                    </div>
                    {selectedNoteIds.length === 1 && (
                      <p className="text-xs text-burgundy mt-1 font-ui">
                        Add 1 more note to unlock 15% off
                      </p>
                    )}
                    {selectedNoteIds.length >= 2 && selectedNoteIds.length < 10 && (
                      <p className="text-xs text-slate-500 mt-1 font-ui">
                        Add {10 - selectedNoteIds.length} more to get 20% off
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleAddCustomBundle}
                    disabled={selectedNoteIds.length < 1}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-burgundy text-parchment rounded-xl font-ui font-bold text-sm hover:bg-burgundy-light transition-all shadow-lg shadow-burgundy/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {selectedNoteIds.length === 1 ? 'Add to Cart' : 'Add Bundle to Cart'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes grid */}
          <div className="p-4 sm:p-6">
            {/* Search filter */}
            <div className="mb-4">
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search notes by title or category..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-ui text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/50"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <p className="text-center text-slate-400 font-ui py-8">No notes found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] sm:max-h-[520px] overflow-y-auto pr-1">
                {filteredNotes.map((note) => {
                  const id = String(note.id);
                  const isSelected = selectedNoteIds.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleNote(id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all text-left min-h-[64px] active:scale-[0.98] ${
                        isSelected
                          ? 'border-burgundy bg-burgundy/5 shadow-sm'
                          : 'border-slate-100 hover:border-burgundy/30 bg-white'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-burgundy border-burgundy' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-semibold text-sm text-ink line-clamp-2 leading-snug">
                          {note.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{note.category}</p>
                      </div>
                      <span className="text-gold font-display font-bold text-sm shrink-0 ml-1">
                        ₹{note.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Empty state CTA */}
          {!loading && selectedNoteIds.length === 0 && (
            <div className="px-4 sm:px-6 pb-5 text-center">
              <p className="text-sm text-slate-400 font-ui">
                Select notes above — pick 2+ to unlock bundle discounts
              </p>
            </div>
          )}
        </div>

        {/* ── PRE-MADE BUNDLES ── collapsible on mobile */}
        <div className="mb-10">
          <button
            onClick={() => setShowPrebuilt(!showPrebuilt)}
            className="w-full flex items-center justify-between mb-5 group"
          >
            <div className="text-left">
              <h2 className="font-display text-xl sm:text-2xl text-ink">Pre-made Bundles</h2>
              <p className="text-sm text-slate-400 font-ui">Curated subject combos at fixed prices</p>
            </div>
            <div className="flex items-center gap-1 text-burgundy font-ui text-sm font-semibold">
              {showPrebuilt ? <><ChevronUp className="w-4 h-4" /> Hide</> : <><ChevronDown className="w-4 h-4" /> Show</>}
            </div>
          </button>

          <AnimatePresence>
            {showPrebuilt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bundles.map((bundle, index) => (
                    <BundleCard key={bundle.id} bundle={bundle} index={index} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── PRICING TABLE ── responsive */}
        <div>
          <h2 className="font-display text-xl sm:text-2xl text-ink mb-5 text-center">
            Custom Bundle Discount Tiers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: '1 note', discount: 'No discount', bg: 'bg-slate-50', text: 'text-slate-600', badge: '' },
              { label: '2–9 notes', discount: '15% off', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'Most Popular' },
              { label: '10+ notes', discount: '20% off', bg: 'bg-gold/10', text: 'text-[#8B6914]', badge: 'Best Value' },
            ].map((tier, i) => (
              <div key={i} className={`${tier.bg} rounded-2xl p-5 text-center relative`}>
                {tier.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-burgundy text-parchment text-[10px] font-ui font-black uppercase tracking-wider rounded-full whitespace-nowrap">
                    {tier.badge}
                  </span>
                )}
                <p className="font-display text-lg text-ink mb-1">{tier.label}</p>
                <p className={`font-display text-3xl font-bold ${tier.text}`}>{tier.discount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
