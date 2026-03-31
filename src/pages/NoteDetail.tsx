import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  FileText, ShoppingCart, Check, ChevronLeft,
  Shield, Zap, Clock, Star, Package, Download
} from 'lucide-react';
import { getNoteBySlug, notesData, getCategoryColor } from '@/data/notes';
import { useCartStore } from '@/store';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { TrustBadges } from '@/components/ui/TrustBadges';
import { PDFPreview } from '@/components/ui/PDFPreview';
import { ScalesOfJustice3D, SectionBadge } from '@/components/ui/LegalSVGs';

export function NoteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const note = getNoteBySlug(slug || '');
  const { addNote, items } = useCartStore();
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);

  if (!note) {
    return (
      <div className="pt-20 min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <ScalesOfJustice3D className="w-full h-full opacity-50" />
          </div>
          <h1 className="font-display text-2xl text-ink mb-4">Note Not Found</h1>
          <Link to="/marketplace" className="text-[#6B1E2E] hover:underline font-ui">
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
    <div className="pt-20 min-h-screen bg-parchment">
      {/* Breadcrumb */}
      <div className="bg-parchment-dark border-b border-parchment-dark">
        <div className="section-container py-4">
          <div className="flex items-center gap-2 text-sm font-ui">
            <Link to="/" className="text-mutedgray hover:text-[#6B1E2E] transition-colors">Home</Link>
            <ChevronLeft className="w-4 h-4 text-mutedgray rotate-180" />
            <Link to="/marketplace" className="text-mutedgray hover:text-[#6B1E2E] transition-colors">Marketplace</Link>
            <ChevronLeft className="w-4 h-4 text-mutedgray rotate-180" />
            <span className="text-ink font-medium">{note.title}</span>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left - PDF Preview */}
          <div>
            <PDFPreview
              totalPages={note.totalPages}
              hasAccess={hasAccess}
              onPurchase={handleAddToCart}
              price={note.price}
            />
          </div>

          {/* Right - Purchase Panel */}
          <div className="space-y-6">
            {/* Note Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-parchment-dark">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui font-medium rounded-lg mb-3"
                    style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {note.category}
                  </span>
                  <h1 className="font-display text-2xl lg:text-3xl text-ink">{note.title}</h1>
                </div>
                {note.isNew && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-ink rounded-full text-sm font-ui font-medium">
                    NEW
                  </span>
                )}
              </div>

              <p className="font-body text-mutedgray mb-6 leading-relaxed">{note.description}</p>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-[#6B1E2E]/5 to-transparent rounded-xl border border-[#6B1E2E]/10">
                  <FileText className="w-5 h-5 text-[#6B1E2E] mx-auto mb-2" />
                  <p className="font-display text-xl text-ink">{note.totalPages}</p>
                  <p className="text-xs text-mutedgray">Pages</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#C9A84C]/10 to-transparent rounded-xl border border-[#C9A84C]/20">
                  <Download className="w-5 h-5 text-[#C9A84C] mx-auto mb-2" />
                  <p className="font-display text-xl text-ink">PDF</p>
                  <p className="text-xs text-mutedgray">Format</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#6B1E2E]/5 to-transparent rounded-xl border border-[#6B1E2E]/10">
                  <Clock className="w-5 h-5 text-[#6B1E2E] mx-auto mb-2" />
                  <p className="font-display text-xl text-ink">{note.language}</p>
                  <p className="text-xs text-mutedgray">Language</p>
                </div>
              </div>

              {/* Table of Contents Preview */}
              <div className="mb-6">
                <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#6B1E2E]/10 flex items-center justify-center">
                    <span className="text-[#6B1E2E] text-xs">§</span>
                  </span>
                  Contents Preview
                </h3>
                <div className="space-y-2">
                  {note.tableOfContents.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2.5 bg-parchment/50 rounded-lg hover:bg-parchment transition-colors">
                      <SectionBadge number={(index + 1).toString()} className="w-8 h-8" />
                      <span className="font-ui text-sm text-ink">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="border-t border-parchment-dark pt-6">
                <PriceDisplay 
                  price={note.price} 
                  originalPrice={note.originalPrice}
                  size="lg"
                  showSavings
                />

                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`w-full mt-4 py-4 rounded-xl font-ui font-semibold transition-all flex items-center justify-center gap-2 ${
                    isInCart 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] text-parchment hover:shadow-lg hover:shadow-[#6B1E2E]/30 hover:scale-[1.02]'
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
                  <div className="mt-3 p-3 bg-green-50 text-green-600 rounded-lg text-center font-ui text-sm">
                    ✓ Added to cart successfully!
                  </div>
                )}

                <TrustBadges variant="horizontal" size="sm" />
              </div>
            </div>

            {/* Bundle Upsell */}
            <div className="bg-gradient-to-br from-[#C9A84C]/10 to-[#C9A84C]/5 rounded-2xl p-6 border border-[#C9A84C]/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E8C97A] flex items-center justify-center">
                  <Package className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink">Get More Value</h3>
                  <p className="text-xs text-mutedgray">Bundle & Save</p>
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
            <div className="bg-white rounded-2xl p-6 shadow-card border border-parchment-dark">
              <h3 className="font-display text-lg mb-4">What's Included</h3>
              <ul className="space-y-3">
                {[
                  { icon: Shield, text: 'Secure watermarked PDF download' },
                  { icon: Zap, text: 'Instant access after purchase' },
                  { icon: Star, text: 'Regular updates with new amendments' },
                  { icon: Download, text: 'Lifetime access to your notes' },
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#6B1E2E]/10 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-[#6B1E2E]" />
                    </div>
                    <span className="font-ui text-sm text-ink">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Notes */}
        {relatedNotes.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl text-ink mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B1E2E] to-[#8B2E42] flex items-center justify-center">
                <FileText className="w-4 h-4 text-parchment" />
              </span>
              Related Notes
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNotes.map((relatedNote) => (
                <Link
                  key={relatedNote.id}
                  to={`/notes/${relatedNote.slug}`}
                  className="bg-white rounded-xl p-4 shadow-card hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-4 border border-parchment-dark group"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${categoryColor}15` }}
                  >
                    <FileText className="w-7 h-7" style={{ color: categoryColor }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-ui font-medium text-ink line-clamp-1 group-hover:text-[#6B1E2E] transition-colors">{relatedNote.title}</h3>
                    <p className="text-gold font-display">₹{relatedNote.price}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-mutedgray rotate-180 group-hover:text-[#6B1E2E] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
