import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, Layers, Share2, ChevronRight, X, 
  ChevronLeft, ArrowRight 
} from 'lucide-react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SubtleHook } from './SubtleHook';

// --- Types ---
interface Flashcard { id: string; front: string; back: string; hint?: string; image?: string; }
interface FlashcardDeck {
  id: string; title: string; subject: string; category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  cards: Flashcard[]; status: string;
}

// --- Style maps ---
const difficultyStyle: Record<string, string> = {
  Beginner:     'bg-green-100 text-green-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Expert:       'bg-red-100 text-red-700',
};

const PLACEHOLDER_DECKS: FlashcardDeck[] = [
  { id: 'ph-1', title: 'Contract Law Essentials', subject: 'Contract Law', category: 'Civil Law', difficulty: 'Beginner', status: 'coming-soon', cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }] },
  { id: 'ph-2', title: 'Constitutional Fundamentals', subject: 'Constitutional Law', category: 'Public Law', difficulty: 'Intermediate', status: 'coming-soon', cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }] },
  { id: 'ph-3', title: 'Criminal Law Concepts', subject: 'Criminal Law', category: 'Criminal Law', difficulty: 'Intermediate', status: 'coming-soon', cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }] },
  { id: 'ph-4', title: 'Corporate Law Mastery', subject: 'Companies Act', category: 'Corporate Law', difficulty: 'Expert', status: 'coming-soon', cards: [{ id: 'ph-c1', front: 'Coming Soon', back: 'This deck is being prepared.' }] },
];

/** ─── Deck Card ─── */
function DeckCard({ deck, index, onOpen }: { deck: FlashcardDeck; index: number; onOpen: (d: FlashcardDeck) => void }) {
  const isPlaceholder = deck.status === 'coming-soon';
  const [deckShared, setDeckShared] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: deck.title,
      url: `${window.location.origin}/legal-playground/flashcards`
    };
    if (navigator.share) {
      try { 
        await navigator.share(shareData);
        setDeckShared(true);
        setTimeout(() => setDeckShared(false), 2000);
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(shareData.url);
      setDeckShared(true);
      setTimeout(() => setDeckShared(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={() => !isPlaceholder && onOpen(deck)}
      className={`group relative flex flex-col justify-between bg-white border border-ink/10 rounded-2xl p-5 transition-all ${isPlaceholder ? 'opacity-60 cursor-default' : 'cursor-pointer hover:border-gold/40 hover:shadow-xl hover:-translate-y-0.5'} sm:w-full w-56`}
    >
      <span className={`self-start px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 ${difficultyStyle[deck.difficulty] ?? 'bg-slate-100 text-slate-500'}`}>{deck.difficulty}</span>
      <div className="flex-1 min-h-0">
        <h4 className="font-display text-base text-ink leading-snug line-clamp-2 group-hover:text-burgundy transition-colors mb-1">{deck.title}</h4>
        <p className="font-ui text-[11px] text-mutedgray uppercase tracking-widest">{deck.subject}</p>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink/5">
        <span className="flex items-center gap-1 text-[11px] font-ui text-ink/40">
          <Layers className="w-3.5 h-3.5" />{isPlaceholder ? '—' : `${deck.cards.length} cards`}
        </span>
        <div className="flex items-center gap-2">
          {!isPlaceholder && (
            <button
              onClick={handleShare}
              title="Share this deck"
              className="p-1 text-ink/20 hover:text-gold transition-colors"
            >
              {deckShared
                ? <span className="text-[9px] text-green-500 font-bold font-ui">Copied!</span>
                : <Share2 className="w-3.5 h-3.5" />
              }
            </button>
          )}
          {isPlaceholder
            ? <span className="text-[10px] font-ui text-amber-500 font-bold uppercase tracking-widest">Coming Soon</span>
            : <ChevronRight className="w-4 h-4 text-ink/30 group-hover:text-burgundy transition-colors" />
          }
        </div>
      </div>
    </motion.div>
  );
}

/** ─── Flashcard Modal (Inshorts style) ─── */
function FlashcardModal({ deck, onClose }: { deck: FlashcardDeck; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentCard = deck.cards[activeIdx];

  const handleNext = () => {
    if (isAnimating) return;
    if (activeIdx < deck.cards.length - 1) {
      setIsAnimating(true);
      setTimeout(() => { setActiveIdx(p => p + 1); setIsFlipped(false); setIsAnimating(false); }, 300);
    } else { onClose(); }
  };
  const handlePrev = () => {
    if (isAnimating || activeIdx === 0) return;
    setIsAnimating(true);
    setTimeout(() => { setActiveIdx(p => p - 1); setIsFlipped(false); setIsAnimating(false); }, 300);
  };
  const handleFlip = () => setIsFlipped(v => !v);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); handleFlip(); }
      if (e.code === 'ArrowRight' || e.code === 'Enter') handleNext();
      if (e.code === 'ArrowLeft') handlePrev();
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIdx, isFlipped, isAnimating]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/60 backdrop-blur-md p-2 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg bg-parchment rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        style={{ height: 'min(90vh, 720px)' }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-1 pt-1 z-20">
          {deck.cards.map((_, i) => (
            <div key={i} className={`h-full rounded-full transition-all duration-500 ${i <= activeIdx ? 'bg-gold' : 'bg-ink/10'} w-full`} />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8 pb-4">
          <div>
            <span className="text-[10px] font-ui text-gold uppercase font-black tracking-[0.2em] mb-1 block">{deck.subject}</span>
            <h3 className="font-display text-xl text-ink leading-tight">{deck.title}</h3>
          </div>
          <button onClick={onClose} className="p-4 bg-ink/5 hover:bg-ink/10 rounded-2xl text-ink/40 transition-all active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Card area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ x: 100, opacity: 0, rotate: 5 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -100, opacity: 0, rotate: -5 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="w-full h-full max-h-[380px] relative cursor-pointer group"
              onClick={handleFlip}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 80 }}
                className="w-full h-full relative preserve-3d"
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white border border-ink/5 rounded-[2rem] p-8 sm:p-10 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-shadow">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gold/10 text-gold text-[9px] font-ui font-black uppercase tracking-widest rounded-full">Question</span>
                  </div>
                  <p className="font-display text-xl sm:text-2xl text-ink text-center leading-relaxed">{currentCard.front}</p>
                  <p className="absolute bottom-8 text-[10px] font-ui text-mutedgray flex items-center gap-2 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />Tap to reveal answer
                  </p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-[#Fdfbf7] border-2 border-gold/20 rounded-[2rem] p-8 sm:p-10 flex flex-col rotate-y-180 shadow-inner overflow-y-auto hide-scrollbar">
                  <div className="shrink-0 flex justify-center mb-6">
                    <span className="px-3 py-1 bg-burgundy/10 text-burgundy text-[9px] font-ui font-black uppercase tracking-widest rounded-full">Context & Resolution</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="font-body text-base sm:text-lg text-ink/90 text-center leading-relaxed whitespace-pre-line">{currentCard.back}</p>
                  </div>
                  {currentCard.hint && (
                    <div className="mt-6 pt-4 border-t border-gold/10 shrink-0">
                      <p className="text-[10px] font-ui text-gold/60 text-center italic leading-relaxed">Tip: {currentCard.hint}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom controls */}
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="flex gap-4">
            <button onClick={handlePrev} disabled={activeIdx === 0} className="w-12 h-12 flex items-center justify-center border border-ink/10 rounded-full text-ink disabled:opacity-20 hover:bg-ink hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="h-12 px-8 flex items-center justify-center bg-burgundy text-parchment rounded-full font-ui text-xs font-bold hover:bg-burgundy-light transition-colors shadow-lg">
              {activeIdx === deck.cards.length - 1 ? 'Finish Deck' : 'Next Card'}
            </button>
          </div>
          <div className="font-ui text-[11px] font-black text-ink/30 uppercase tracking-[0.2em]">{activeIdx + 1} / {deck.cards.length}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const FlashcardTool: React.FC = () => {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);

  useEffect(() => {
    async function loadDecks() {
      setLoading(true);
      try {
        const q = query(collection(db, 'flashcard_decks'), orderBy('title'), limit(12));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as FlashcardDeck[];
        setDecks(data.length > 0 ? data : PLACEHOLDER_DECKS);
      } catch (err) {
        setDecks(PLACEHOLDER_DECKS);
      } finally {
        setLoading(false);
      }
    }
    loadDecks();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-8">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/10 text-burgundy rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-4">
            <Brain className="w-3 h-3" /> Knowledge Cards
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-ink">Interactive Flashcards</h2>
          <p className="font-body text-ink/60 mt-2 text-sm sm:text-base">Bite-sized legal concepts to ace your exams</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="shrink-0 w-full h-44 bg-white/60 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {decks.map((deck, idx) => <DeckCard key={deck.id} deck={deck} index={idx} onOpen={setSelectedDeck} />)}
          </div>
        )}

        {/* CTA Hook */}
        <div className="mt-10 pt-8 border-t border-ink/8">
           <SubtleHook textToMatch="notes subjects templates exams" />
        </div>
      </div>

      <AnimatePresence>
        {selectedDeck && (
          <FlashcardModal deck={selectedDeck} onClose={() => setSelectedDeck(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default FlashcardTool;
