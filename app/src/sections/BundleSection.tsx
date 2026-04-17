import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Package, Sparkles, Check, ShoppingCart, Tag, Zap, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BundleCard } from '@/components/ui/BundleCard';
import { bundles } from '@/data/notes';
import { getAllNotes } from '@/lib/db';
import type { Note } from '@/types';
import { useCartStore } from '@/store';
import { toast } from 'sonner';

export function BundleSection() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const { addBundle } = useCartStore();

  useEffect(() => {
    getAllNotes().then(n => { setAllNotes(n); setNotesLoading(false); });
  }, []);

  const { originalPrice, bundlePrice, savings, discountPct } = useMemo(() => {
    const count = selectedIds.length;
    const original = selectedIds.reduce((sum, id) => {
      const note = allNotes.find(n => String(n.id) === id);
      return sum + (note ? note.price : 199);
    }, 0);
    let price = original;
    let pct = 0;
    if (count >= 10) { price = Math.round(original * 0.80); pct = 20; }
    else if (count >= 2) { price = Math.round(original * 0.85); pct = 15; }
    return { originalPrice: original, bundlePrice: price, savings: original - price, discountPct: pct };
  }, [selectedIds, allNotes]);

  const toggle = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAdd = () => {
    if (selectedIds.length < 2) { toast.error('Select at least 2 notes'); return; }
    addBundle({
      id: `custom-${Date.now()}`,
      name: `My Bundle (${selectedIds.length} notes)`,
      slug: 'custom-bundle',
      description: `Custom selection of ${selectedIds.length} subjects`,
      noteIds: selectedIds,
      price: bundlePrice,
      originalPrice,
      isActive: true,
      savingsPercent: discountPct,
    });
    toast.success(`Bundle added — you saved ₹${savings}!`);
    setSelectedIds([]);
  };

  return (
    <section className="py-14 sm:py-20 bg-[#F0EBE3]">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full text-sm font-ui font-medium mb-4">
            <Package className="w-4 h-4" />
            Save More
          </span>
          <h2 className="font-display text-3xl lg:text-4xl text-ink mb-3">
            Bundle & Save —{' '}
            <span className="text-burgundy">Your Way</span>
          </h2>
          <p className="font-body text-[#6B5E52]">
            Pick any subjects you want. 15% off for 2+ notes, 20% off for 10+. No codes needed.
          </p>
        </motion.div>

        {/* ── INLINE BUNDLE BUILDER ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl border border-gold/20 overflow-hidden mb-12"
        >
          {/* Builder top bar */}
          <div className="bg-gradient-to-r from-burgundy to-burgundy-light px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Sparkles className="w-5 h-5 text-gold shrink-0" />
              <div>
                <h3 className="font-display text-lg text-parchment leading-none">Bundle Builder</h3>
                <p className="text-parchment/60 text-xs font-ui mt-0.5">Select notes below — discount auto-applies</p>
              </div>
            </div>
            {/* Discount tier pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-ui font-bold transition-all ${selectedIds.length >= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-white/10 text-white/50'}`}>
                <Tag className="w-3 h-3" />
                2+ notes = 15% off
                {selectedIds.length >= 2 && selectedIds.length < 10 && <Check className="w-3 h-3" />}
              </span>
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-ui font-bold transition-all ${selectedIds.length >= 10 ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/50'}`}>
                <Zap className="w-3 h-3" />
                10+ notes = 20% off
                {selectedIds.length >= 10 && <Check className="w-3 h-3" />}
              </span>
            </div>
          </div>

          {/* Live price bar */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#FBF8F3] border-b border-gold/15 overflow-hidden"
              >
                <div className="px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <span className="font-ui text-sm text-slate-500">{selectedIds.length} note{selectedIds.length > 1 ? 's' : ''} → </span>
                    <span className="font-display text-xl text-gold font-bold">₹{bundlePrice}</span>
                    {savings > 0 && (
                      <span className="ml-2 text-xs font-ui font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        You save ₹{savings} ({discountPct}% off)
                      </span>
                    )}
                    {selectedIds.length === 1 && (
                      <span className="ml-2 text-xs text-burgundy font-ui">Add 1 more for 15% off</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedIds([])}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Clear selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleAdd}
                      disabled={selectedIds.length < 2}
                      className="flex items-center gap-2 px-4 py-2 bg-burgundy text-parchment rounded-xl font-ui font-bold text-sm hover:bg-burgundy-light transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes selection grid */}
          <div className="p-4 sm:p-5">
            {notesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : allNotes.length === 0 ? (
              <p className="text-center text-slate-400 font-ui py-6 text-sm">No notes available yet</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {allNotes.map(note => {
                    const id = String(note.id);
                    const sel = selectedIds.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggle(id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all active:scale-[0.97] ${
                          sel
                            ? 'border-burgundy bg-burgundy/5'
                            : 'border-slate-100 hover:border-burgundy/25 bg-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          sel ? 'bg-burgundy border-burgundy' : 'border-slate-300'
                        }`}>
                          {sel && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-ui font-semibold text-xs text-ink line-clamp-1">{note.title}</p>
                          <p className="text-[10px] text-slate-400">{note.category}</p>
                        </div>
                        <span className="text-gold font-display font-bold text-xs shrink-0">₹{note.price}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 text-center">
                  <Link
                    to="/bundles"
                    className="inline-flex items-center gap-1 text-burgundy text-xs font-ui font-semibold hover:underline underline-offset-2"
                  >
                    Open full Bundle Builder
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Pre-made bundles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-display text-xl text-ink mb-5 text-center">
            Or choose a pre-made bundle
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {bundles.slice(0, 3).map((bundle, index) => (
              <BundleCard key={bundle.id} bundle={bundle} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/bundles"
              className="inline-flex items-center gap-2 text-burgundy font-ui font-semibold hover:underline underline-offset-2"
            >
              View all bundles & pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
