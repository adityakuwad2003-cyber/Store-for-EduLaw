import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  FileText, ShoppingCart, Check, ChevronLeft,
  Shield, Zap, Clock, Star, Package, Download, Loader2
} from 'lucide-react';
import { notesData, getCategoryColor } from '@/data/notes';
import { getNoteBySlug } from '@/lib/db';
import type { Note } from '@/types';
import { useCartStore } from '@/store';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { TrustBadges } from '@/components/ui/TrustBadges';
import { PDFPreview } from '@/components/ui/PDFPreview';
import { ScalesOfJustice3D, SectionBadge } from '@/components/ui/LegalSVGs';
import { SEO } from '@/components/SEO';
import { StructuredData, getProductSchema } from '@/components/StructuredData';

export function NoteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [note, setNote]                     = useState<Note | null | undefined>(undefined);
  const [isLoading, setIsLoading]           = useState(true);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>();
  const { addNote, items }                  = useCartStore();
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);

  useEffect(() => {
    if (!slug) { setIsLoading(false); return; }
    getNoteBySlug(slug).then(async (fetchedNote) => {
      setNote(fetchedNote ?? null);
      setIsLoading(false);
      // Fetch preview image URL from R2 if admin uploaded one
      if (fetchedNote?.previewImageKey) {
        try {
          const res = await fetch(
            `/api/get-download-link?previewKey=${encodeURIComponent(fetchedNote.previewImageKey)}`
          );
          if (res.ok) {
            const { url } = await res.json();
            setPreviewImageUrl(url);
          }
        } catch {
          // preview URL fetch failed silently — NoPreviewCard will show instead
        }
      }
    });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B1E2E]" />
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

  const relatedNotes = notesData
    .filter(n => n.category === note.category && n.id !== note.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (!isInCart) {
      addNote(note);
      setShowPurchaseSuccess(true);
      setTimeout(() => setShowPurchaseSuccess(false), 2000);
    }
  };

  const categoryColor = getCategoryColor(note.category);

  return (
    <div 
      className="pt-20 min-h-screen bg-slate-50"
      style={{ '--cat-fg': categoryColor, '--cat-bg': `${categoryColor}15` } as any}
    >
      <SEO 
        title={`${note.title} | Legal Study Materials India`}
        description={`${note.description.slice(0, 150)}... Buy ${note.title} for Law Students and Judiciary aspirants. Trusted by 1L+ legal learners in India.`}
        canonical={`/product/${note.slug}`}
        ogType="product"
        ogImage={note.thumbnailUrl}
      />
      <StructuredData data={getProductSchema(note)} />
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://store.theedulaw.in" },
          { "@type": "ListItem", "position": 2, "name": "Marketplace", "item": "https://store.theedulaw.in/marketplace" },
          { "@type": "ListItem", "position": 3, "name": note.title, "item": `https://store.theedulaw.in/product/${note.slug}` }
        ]
      }} />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="section-container py-4">
          <nav className="flex items-center gap-2 text-xs font-ui uppercase tracking-widest font-bold" aria-label="Breadcrumb">
            <Link to="/" className="text-slate-400 hover:text-gold transition-colors">Home</Link>
            <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180" />
            <Link to="/marketplace" className="text-slate-400 hover:text-gold transition-colors">Marketplace</Link>
            <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180" />
            <span className="text-slate-900 font-bold" aria-current="page">{note.title}</span>
          </nav>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - PDF Preview */}
          <div>
            <PDFPreview
              pdfUrl={note.pdfUrl}
              previewImageUrl={previewImageUrl}
              totalPages={note.totalPages}
              hasAccess={hasAccess}
              onPurchase={handleAddToCart}
              price={note.price}
            />
          </div>

          {/* Right - Purchase Panel */}
          <div className="space-y-6">
            {/* Note Info Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-ui font-black uppercase tracking-[0.2em] rounded-lg mb-4 bg-[var(--cat-bg)] text-[var(--cat-fg)]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {note.category}
                  </span>
                  <h1 className="font-display text-3xl lg:text-4xl text-slate-900 font-bold leading-tight">{note.title}</h1>
                </div>
                {note.isNew && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-ink rounded-full text-sm font-ui font-medium">
                    NEW
                  </span>
                )}
              </div>

              <p className="font-ui text-slate-500 mb-8 leading-relaxed text-base">{note.description}</p>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group/meta hover:border-gold/30 transition-all">
                  <FileText className="w-5 h-5 text-slate-400 group-hover/meta:text-gold mx-auto mb-2 transition-colors" />
                  <p className="font-display text-xl text-slate-900 font-bold">{note.totalPages}</p>
                  <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400">Pages</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group/meta hover:border-gold/30 transition-all">
                  <Download className="w-5 h-5 text-slate-400 group-hover/meta:text-gold mx-auto mb-2 transition-colors" />
                  <p className="font-display text-xl text-slate-900 font-bold">PDF</p>
                  <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400">Format</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group/meta hover:border-gold/30 transition-all">
                  <Clock className="w-5 h-5 text-slate-400 group-hover/meta:text-gold mx-auto mb-2 transition-colors" />
                  <p className="font-display text-xl text-slate-900 font-bold">{note.language}</p>
                  <p className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400">Language</p>
                </div>
              </div>

              {/* Table of Contents Preview */}
              <div className="mb-6">
                <h3 className="font-display text-lg mb-4 flex items-center gap-2 text-slate-900 font-bold">
                  <span className="w-6 h-6 rounded bg-gold/10 flex items-center justify-center">
                    <span className="text-gold text-xs font-bold">§</span>
                  </span>
                  Contents Preview
                </h3>
                <div className="space-y-2">
                  {note.tableOfContents?.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2.5 bg-parchment/50 rounded-lg hover:bg-parchment transition-colors">
                      <SectionBadge number={(index + 1).toString()} className="w-8 h-8" />
                      <span className="font-ui text-sm text-ink">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="border-t border-slate-100 pt-6">
                <PriceDisplay 
                  price={note.price} 
                  originalPrice={note.originalPrice}
                  size="lg"
                  showSavings
                />

                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`w-full mt-4 py-4 rounded-xl font-ui font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                    isInCart 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 active:scale-[0.98]'
                  }`}
                >
                  {isInCart ? (
                    <><Check className="w-5 h-5" /> Added to Cart</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> Buy This Note — ₹{note.price}</>
                  )}
                </button>

                {/* Success Message */}
                {showPurchaseSuccess && (
                  <div className="mt-3 p-3 bg-green-50 text-green-600 rounded-lg text-center font-ui text-xs font-bold uppercase tracking-widest border border-green-100">
                    ✓ Added to cart successfully!
                  </div>
                )}

                <TrustBadges variant="horizontal" size="sm" />
              </div>
            </div>

            {/* Bundle Upsell */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
                  <Package className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-white font-bold leading-tight">Value Bundle Offer</h3>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black">Limited Time Saving</p>
                </div>
              </div>
              <p className="text-sm text-mutedgray mb-4">
                Add 2 more notes and get them all for just <span className="font-display text-[#C9A84C]">₹450</span> (Save ₹147)
              </p>
              <Link
                to="/bundles"
                className="inline-flex items-center gap-2 text-[#6B1E2E] font-ui font-medium hover:underline"
              >
                View Bundle Offers
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h3 className="font-display text-lg mb-6 text-slate-900 font-bold">What's Included</h3>
              <ul className="space-y-3">
                {[
                  { icon: Shield, text: 'Secure PDF download' },
                  { icon: Zap, text: 'Instant access post-payment' },
                  { icon: Star, text: 'Regular updates included' },
                  { icon: Download, text: 'Lifetime access' },
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group/feature hover:border-gold/30 transition-all">
                      <feature.icon className="w-4 h-4 text-slate-400 group-hover/feature:text-gold transition-colors" />
                    </div>
                    <span className="font-ui text-sm text-slate-600">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Students Also Bought (Related Notes) */}
        {relatedNotes.length > 0 && (
          <div className="mt-16 bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
            <h2 className="font-display text-2xl lg:text-3xl text-slate-900 mb-10 flex items-center gap-4 font-bold">
              <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
                <ShoppingCart className="w-5 h-5 text-slate-900" />
              </div>
              Students also <span className="text-gold">bought</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNotes.map((relatedNote) => (
                <Link
                  key={relatedNote.id}
                  to={`/product/${relatedNote.slug}`}
                  className="group bg-slate-50 rounded-2xl p-6 hover:bg-white hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-slate-200"
                >
                  <div className="flex items-center gap-5">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-white/50 bg-[var(--cat-bg)]"
                    >
                      <FileText className="w-8 h-8 text-[var(--cat-fg)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-ui font-bold text-slate-900 truncate group-hover:text-gold transition-colors">
                        {relatedNote.title}
                      </h3>
                      <p className="text-gold font-display text-xl font-bold">₹{relatedNote.price}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md group-hover:translate-x-1">
                      <ChevronLeft className="w-5 h-5 text-slate-900 rotate-180" />
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
