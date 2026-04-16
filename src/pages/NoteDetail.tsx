import { useState, useEffect, useMemo, Component, type ReactNode } from 'react';

/** Isolates PDFPreview crashes so the rest of the product page still renders */
class PDFErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <p className="font-display text-lg text-slate-900 font-bold">Preview Unavailable</p>
          <p className="text-sm text-slate-500 font-ui">Purchase to unlock the full document.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
import { Link, useParams } from 'react-router-dom';
import {
  Shield, Zap, Clock, Star, Loader2,
  FileText, ShoppingCart, Check, ChevronLeft, Users, GraduationCap, Brain
} from 'lucide-react';
import { getCategoryColor, mockTests } from '@/data/notes';
import { getNoteBySlug, getAllNotes } from '@/lib/db';
import type { Note } from '@/types';
import { useUIStore, useCartStore } from '@/store';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { TrustBadges } from '@/components/ui/TrustBadges';
import { PDFPreview } from '@/components/ui/PDFPreview';
import { ScalesOfJustice3D } from '@/components/ui/LegalSVGs';
import { SEO } from '@/components/SEO';
import { StructuredData, getProductSchema } from '@/components/StructuredData';
import { ReviewsSection } from '@/components/ui/ReviewsSection';

const LAW_COLLEGES = [
  'NLU Delhi', 'NLU Jodhpur', 'NLSIU Bangalore', 'GLC Mumbai',
  'Symbiosis Law', 'Jindal Global', 'Campus Law Centre', 'NLU Kolkata',
  'Faculty of Law DU', 'NLU Hyderabad', 'Amity Law', 'HNLU Raipur',
];

function studiedByColleges(noteId: number | string): [string, string, string] {
  const n = typeof noteId === 'string'
    ? noteId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : Number(noteId);
  const pick = (seed: number) => LAW_COLLEGES[Math.abs(seed) % LAW_COLLEGES.length];
  const c1 = pick(n);
  const c2 = pick(n * 3 + 7);
  const c3 = pick(n * 11 + 13);
  // ensure unique
  const unique = [...new Set([c1, c2, c3, ...LAW_COLLEGES])].slice(0, 3) as [string, string, string];
  return unique;
}

function viewingNow(noteId: number | string): number {
  const slot = Math.floor(Date.now() / 300_000);
  const n = typeof noteId === 'string'
    ? noteId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : Number(noteId);
  return (((n * 7 + slot * 3) % 11) % 7) + 3; // 3–9
}
import { ShareButton } from '@/components/ui/ShareButton';
import { FrequentlyBoughtTogether } from '@/components/note-detail/FrequentlyBoughtTogether';


export function NoteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [note, setNote]                     = useState<Note | null | undefined>(undefined);
  const [isLoading, setIsLoading]           = useState(true);
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([]);
  const [samplePdfUrl, setSamplePdfUrl]       = useState<string | undefined>();
  const [relatedNotes, setRelatedNotes]       = useState<Note[]>([]);
  const { addNote, addTest, addAudioSummary, removeItem, items } = useCartStore();

  const [isMcqSelected, setIsMcqSelected] = useState(false);
  const [isAudioSelected, setIsAudioSelected] = useState(false);

  // Helper variables (guarded by note check later or defined here with defaults)
  const relevantTest = note ? (mockTests.find(t => t.category === note.category) || mockTests[0]) : mockTests[0];
  const testId = note ? `test-${relevantTest.id}` : '';
  const audioId = note ? `audio-summary-${note.id}` : '';
  


  useEffect(() => {
    if (!note) return;
    setIsMcqSelected(items.some(i => i.id === testId));
    setIsAudioSelected(items.some(i => i.id === audioId));
  }, [note, items, testId, audioId]);

  useEffect(() => {
    if (!slug) { setIsLoading(false); return; }
    getNoteBySlug(slug).then(async (fetchedNote) => {
      setNote(fetchedNote ?? null);
      setIsLoading(false);

      if (!fetchedNote) return;

      // Parallel fetch for Preview Image and Sample PDF
      const fetchPreview = async () => {
        const keys = fetchedNote.previewImageKeys || (fetchedNote.previewImageKey ? [fetchedNote.previewImageKey] : []);
        if (keys.length > 0) {
          try {
            const urls = await Promise.all(keys.map(async (key) => {
              const res = await fetch(`/api/get-download-link?previewKey=${encodeURIComponent(key)}`);
              if (res.ok) {
                const { url } = await res.json();
                return url;
              }
              return null;
            }));
            setPreviewImageUrls(urls.filter((u): u is string => u !== null));
          } catch {}
        }
      };

      const fetchSample = async () => {
        if (fetchedNote.samplePdfKey) {
          try {
            const res = await fetch(`/api/get-download-link?previewKey=${encodeURIComponent(fetchedNote.samplePdfKey)}`);
            if (res.ok) {
              const { url } = await res.json();
              setSamplePdfUrl(url);
            }
          } catch {}
        }
      };

      await Promise.all([fetchPreview(), fetchSample()]);
    });
  }, [slug]);

  useEffect(() => {
    if (!note) return;
    getAllNotes().then(all => {
      setRelatedNotes(all.filter(n => n.category === note.category && n.id !== note.id).slice(0, 3));
    });
  }, [note]);

  // Must be before early returns — Rules of Hooks
  const viewers = useMemo(() => note ? viewingNow(note.id) : 0, [note?.id]);
  const colleges = useMemo(() => note ? studiedByColleges(note.id) : ['NLU Delhi', 'NLSIU Bangalore', 'GLC Mumbai'] as [string, string, string], [note?.id]);

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="pt-20 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <ScalesOfJustice3D className="w-full h-full opacity-50" />
          </div>
          <h1 className="font-display text-2xl text-slate-900 mb-4">Note Not Found</h1>
          <Link to="/marketplace" className="text-gold hover:underline font-ui">
            Browse all notes
          </Link>
        </div>
      </div>
    );
  }

  const isInCart = items.some(item => item.type === 'note' && item.item.id === note.id);
  const hasAccess = false; // Would check user purchase/subscription status

  const handleBuyNow = () => {
    if (!isInCart) addNote(note);
    // Navigate to cart
    window.location.href = '/cart';
  };

  const handleAddToCart = () => {
    if (!isInCart) {
      addNote(note);
      const noteCount = items.filter(i => i.type === 'note').length + 1;
      useUIStore.getState().setBundleModal(true, noteCount, String(note.id));
    }
  };

  const categoryColor = getCategoryColor(note.category);

  return (
    <div 
      className="pt-20 min-h-screen bg-slate-50"
      style={{ '--cat-fg': categoryColor, '--cat-bg': `${categoryColor}15` } as any}
    >
      <SEO
        title={`${note.title} | Premium Legal Notes`}
        description={`${(note.publicDescription || note.description).slice(0, 150)}...`}
        canonical={`/product/${note.slug}`}
        ogType="product"
      />
      <StructuredData data={getProductSchema(note)} />
      
      {/* Breadcrumb - Slimmer & Clean */}
      <div className="bg-white/80 backdrop-blur-md sticky top-20 z-30 border-b border-slate-200/60">
        <div className="section-container py-3">
          <nav className="flex items-center gap-2 text-[10px] font-ui uppercase tracking-widest font-black" aria-label="Breadcrumb">
            <Link to="/marketplace" className="text-slate-400 hover:text-gold transition-colors">Marketplace</Link>
            <ChevronLeft className="w-3 h-3 text-slate-300" />
            <span className="text-slate-900 truncate" aria-current="page">{note.title}</span>
          </nav>
        </div>
      </div>

      <div className="section-container pt-6 pb-12 lg:py-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ── Left: Interactive Preview (Sticky on LG) ── */}
          <div className="lg:col-span-7 lg:sticky lg:top-36 z-20">
            <PDFErrorBoundary>
              <PDFPreview
                pdfUrl={note.pdfUrl}
                samplePdfUrl={samplePdfUrl}
                previewImageUrls={previewImageUrls}
                totalPages={note.totalPages}
                hasAccess={hasAccess}
                onPurchase={handleBuyNow}
                onAddToCart={handleAddToCart}
                price={note.price}
              />
            </PDFErrorBoundary>
            
            {/* Trust bar under preview */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-60">
              {[
                { icon: Shield, text: 'Verified Legal Content' },
                { icon: Zap, text: 'Instant Digital Delivery' },
                { icon: Star, text: 'Expertly Curated' }
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <t.icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-500">{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Premium Information Panel ── */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 1. Header & Title */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[var(--cat-bg)] text-[var(--cat-fg)] text-[10px] font-ui font-black uppercase tracking-widest rounded-full border border-[var(--cat-fg)]/10">
                  {note.category}
                </span>
                {note.isNew && (
                  <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-ui font-black uppercase tracking-widest rounded-full border border-gold/20">
                    New Revision
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-ink font-bold leading-tight">
                {note.title}
              </h1>
              
              {/* Quick Meta Row */}
              <div className="flex items-center gap-6 pt-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Length</p>
                    <p className="text-sm font-ui font-bold text-slate-900 leading-none">{note.totalPages} Pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Format</p>
                    <p className="text-sm font-ui font-bold text-slate-900 leading-none">High-Res PDF</p>
                  </div>
                </div>
                {/* Live viewers */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Viewing Now</p>
                    <p className="text-sm font-ui font-bold text-indigo-600 leading-none">{viewers} students</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Main CTA Bar */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                <ScalesOfJustice3D className="w-full h-full" />
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[10px] font-ui font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Lifetime Access Price</p>
                  <PriceDisplay
                    price={note.price}
                    originalPrice={note.originalPrice}
                    size="lg"
                    showSavings
                  />
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] font-ui font-black uppercase tracking-widest mb-2 border border-green-100">
                    <Zap className="w-3 h-3 fill-current" /> Instant Download
                  </div>
                </div>
              </div>

              {/* Countdown timer — only when discount is active */}
              {note.originalPrice && note.originalPrice > note.price && (
                <CountdownTimer className="mb-3" />
              )}

              {/* Studied By tags */}
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] font-ui text-slate-400 uppercase tracking-widest font-bold">Studied by</span>
                {colleges.map(c => (
                  <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-ui font-semibold rounded-full">
                    {c}
                  </span>
                ))}
              </div>

              {/* Dual CTA Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full py-5 rounded-2xl font-ui font-black uppercase tracking-[0.15em] text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] bg-burgundy text-parchment hover:bg-burgundy shadow-2xl shadow-burgundy/20"
                >
                  <ShoppingCart className="w-5 h-5" /> BUY NOW — ₹{note.price}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`w-full py-4 rounded-2xl font-ui font-black uppercase tracking-[0.15em] text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] border-2 ${
                    isInCart
                      ? 'border-slate-200 text-slate-400 cursor-default bg-slate-50'
                      : 'border-burgundy text-burgundy hover:bg-burgundy/5'
                  }`}
                >
                  {isInCart ? (
                    <><Check className="w-5 h-5" /> In Cart</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> ADD TO CART</>
                  )}
                </button>
              </div>
              

              <div className="mt-6 border-t border-slate-100 pt-6 space-y-3">
                <Link
                  to={`/mock-tests/note-mcq-${note.slug}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-violet-200 text-violet-700 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all font-ui font-bold text-sm"
                >
                  <Brain className="w-4 h-4" />
                  Practice MCQs (30 Questions)
                </Link>
                <div className="flex items-center justify-between">
                  <TrustBadges variant="horizontal" size="sm" />
                  <ShareButton
                    title={note.title}
                    description={note.description}
                    price={note.price}
                    originalPrice={note.originalPrice}
                    url={`${window.location.origin}/product/${note.slug}`}
                    category={note.category}
                    variant="pill"
                    note={note}
                  />
                </div>
              </div>
            </div>

            {/* 3. Detailed Rich Description */}
            <div className="space-y-4">
              <h3 className="text-xs font-ui font-black uppercase tracking-[0.2em] text-gold">Overview & Scope</h3>
              <div 
                className="prose prose-slate prose-sm max-w-none text-slate-600 font-ui leading-relaxed"
                dangerouslySetInnerHTML={{ __html: note.publicDescription || note.description }} 
              />
            </div>

            {/* 4. Inside the Document (Features) */}
            {note.contentFeatures && note.contentFeatures.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200">
                <h3 className="text-xs font-ui font-black uppercase tracking-[0.2em] text-slate-900 mb-6">Inside the Document</h3>
                <div className="grid grid-cols-1 gap-4">
                  {note.contentFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-gold" />
                      </div>
                      <span className="text-sm font-ui text-slate-600 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Key Highlights (Featured Sections) */}
            {note.featuredSections && note.featuredSections.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-ui font-black uppercase tracking-[0.2em] text-slate-900">Premium Highlights</h3>
                <div className="space-y-4">
                  {note.featuredSections.map((section, i) => (
                    <div key={i} className="p-6 bg-burgundy/[0.02] border border-burgundy/5 rounded-3xl">
                      <h4 className="text-sm font-ui font-black text-slate-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-burgundy rounded-full" />
                        {section.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-ui leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Practice MCQs Teaser ── */}
        <div className="mt-10 sm:mt-12">
          <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-violet-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg">Test Your Knowledge</h3>
                  <p className="text-sm text-slate-500 font-ui mt-1 max-w-sm">
                    30 curated MCQs — Easy, Medium &amp; Hard — with instant answer reveal &amp; explanations.
                    Perfect for judiciary and LLB exam prep.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['🟢 10 Easy', '🟡 10 Medium', '🔴 10 Hard'].map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-white border border-violet-100 rounded-full text-[11px] font-ui font-semibold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                to={`/mock-tests/note-mcq-${note.slug}`}
                className="shrink-0 flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-ui font-bold text-sm hover:bg-violet-700 transition-all shadow-md shadow-violet-200 active:scale-95 whitespace-nowrap"
              >
                <Brain className="w-4 h-4" />
                Start Quiz →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Frequently Bought Together (Flipkart-Style Cross-Sell) ── */}
        <div className="mt-12 sm:mt-16">
          <FrequentlyBoughtTogether
            baseNote={note}
            mcqSelected={isMcqSelected}
            audioSelected={isAudioSelected}
            isInCart={isInCart}
            onUpdateCart={() => {
              if (!isInCart) addNote(note);
              
              if (isMcqSelected && !items.some(i => i.id === testId)) {
                  addTest(relevantTest as any);
              } else if (!isMcqSelected && items.some(i => i.id === testId)) {
                  removeItem(testId);
              }

              if (isAudioSelected && !items.some(i => i.id === audioId)) {
                  addAudioSummary({
                      id: `summary-${note.id}`,
                      noteId: note.id,
                      title: `${note.title} (Audio Summary)`,
                      price: 49
                  });
              } else if (!isAudioSelected && items.some(i => i.id === audioId)) {
                  removeItem(audioId);
              }
            }}
          />
        </div>

        {/* ── Curriculum Structure ── */}
        <div className="mt-12 sm:mt-16">
          <div className="w-full bg-white rounded-[2rem] p-6 sm:p-10 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-display text-2xl text-slate-900 font-bold">Curriculum Structure</h3>
              <div className="flex items-center gap-2 text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest">
                <FileText className="w-4 h-4" /> Comprehensive Chapters
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
              {(note.tableOfContents || []).map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50 group hover:border-gold/30 transition-colors">
                  <span className="text-[10px] font-ui font-black text-slate-300 group-hover:text-gold transition-colors">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-sm font-ui text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <ReviewsSection noteId={String(note.id)} noteName={note.title} />

        {relatedNotes.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <h2 className="font-display text-2xl sm:text-3xl text-slate-900 mb-8 sm:mb-10 flex flex-wrap items-center gap-2 sm:gap-4 font-bold">
              Frequently <span className="text-gold">purchased</span> together
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedNotes.map((relatedNote) => (
                <Link
                  key={relatedNote.id}
                  to={`/product/${relatedNote.slug}`}
                  className="group bg-white rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-gold/20 flex flex-col"
                >
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-slate-400 group-hover:text-gold transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-ui font-bold text-slate-900 group-hover:text-gold transition-colors truncate">
                        {relatedNote.title}
                      </h3>
                      <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400">{relatedNote.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                    <p className="font-display text-xl text-slate-900 font-black">₹{relatedNote.price}</p>
                    <div className="flex items-center gap-2 text-[10px] font-ui font-black uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                      View Details <ChevronLeft className="w-3 h-3 rotate-180" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
