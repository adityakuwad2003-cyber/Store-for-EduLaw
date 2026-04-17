import { useState, useEffect, useRef, Suspense } from 'react';
import { Document, Page } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, Lock, Eye, ShoppingCart, Loader2, AlertCircle, Image as ImageIcon, Plus
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFPreviewProps {
  /** Full PDF URL — used only after purchase (hasAccess = true) */
  pdfUrl?: string;
  /** Dedicated Sample PDF URL — used for public preview */
  samplePdfUrl?: string;
  /** Presigned R2 URL for the admin-uploaded preview image */
  previewImageUrl?: string;
  /** Array of presigned R2 URLs for multiple preview images */
  previewImageUrls?: string[];
  totalPages: number;
  hasAccess: boolean;
  onPurchase: () => void;
  onAddToCart?: () => void;
  price: number;
}

/** EduLaw logo watermark overlay — 5% opacity, centred */
function LogoWatermark() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center select-none">
      <img
        src="/images/edulaw-logo.png"
        alt=""
        aria-hidden="true"
        className="w-2/3 max-w-xs object-contain opacity-[0.05]"
        draggable={false}
      />
    </div>
  );
}

/** Image-based preview (no react-pdf needed) with watermark + lock overlay */
function ImagePreview({
  imageUrls,
  onPurchase,
  onAddToCart,
  price,
  totalPages,
}: {
  imageUrls: string[];
  onPurchase: () => void;
  onAddToCart?: () => void;
  price: number;
  totalPages: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col relative group">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 z-50 shrink-0 shadow-sm font-ui">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Eye className="w-4 h-4 text-burgundy" />
            <span className="font-ui text-sm font-semibold text-burgundy">SAMPLE PREVIEW</span>
          </div>
          <span className="font-ui text-xs text-slate-400 hidden sm:inline">
            {imageUrls.length > 1 ? `${imageUrls.length} Previews available` : 'Free preview'} · {totalPages} pages after purchase
          </span>
        </div>
        {imageUrls.length > 1 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollRef.current?.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' })}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-burgundy w-4' : 'bg-slate-300 w-1.5 hover:bg-slate-400'}`}
                  aria-label={`Go to preview ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Scrollable Images */}
      <div className="relative bg-slate-100 overflow-hidden flex-1 touch-pan-y">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full touch-pan-x"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain'
          }}
        >
          {imageUrls.map((url, i) => (
            <div key={i} className="min-w-full snap-center relative flex items-center justify-center">
              <img
                src={url}
                alt={`Note preview ${i + 1}`}
                className="w-full object-contain max-h-[600px] pointer-events-none select-none"
                draggable={false}
              />
              <LogoWatermark />
            </div>
          ))}
        </div>

        {/* Navigation Arrows — always visible when multiple images */}
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: -scrollRef.current.clientWidth, behavior: 'smooth' })}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-600 transition-all z-20 shadow-lg hover:bg-white hover:scale-105 active:scale-95"
              aria-label="Previous preview image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: scrollRef.current.clientWidth, behavior: 'smooth' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-600 transition-all z-20 shadow-lg hover:bg-white hover:scale-105 active:scale-95"
              aria-label="Next preview image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            {/* Swipe hint — shown briefly then fades out */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <span className="text-[10px] font-ui font-bold text-slate-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-slate-200 shadow-sm opacity-70">
                {activeIndex + 1} / {imageUrls.length}
              </span>
            </div>
          </>
        )}

        {/* Gradient fade + lock CTA */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-white via-white/60 to-transparent flex items-end z-30 pointer-events-none">
          <div className="w-full px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xl p-2.5 sm:p-4 flex flex-row items-center gap-2 sm:gap-4 max-w-3xl mx-auto"
            >
              {/* Icon - Smaller on mobile */}
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-burgundy/10 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-burgundy" />
              </div>

              {/* Text - Combined or hidden extra on mobile */}
              <div className="flex-1 min-w-0">
                <p className="font-display text-xs sm:text-base text-slate-900 font-bold truncate">Unlock {totalPages} pages</p>
                <p className="text-[9px] sm:text-xs text-slate-500 font-ui whitespace-nowrap overflow-hidden hidden xs:block">One-time purchase · Instant Access</p>
              </div>

              {/* Buttons - More compact on mobile */}
              <div className="flex flex-row gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={onPurchase}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-5 sm:py-3 bg-burgundy text-parchment rounded-lg sm:rounded-xl font-ui font-black text-[10px] sm:text-sm hover:bg-burgundy active:scale-[0.98] transition-all shadow-lg shadow-burgundy/20"
                >
                  <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">BUY — </span>₹{price}
                </button>
                {onAddToCart && (
                  <button
                    onClick={onAddToCart}
                    className="flex items-center justify-center px-2 py-2 sm:px-4 sm:py-3 border-2 border-burgundy text-burgundy rounded-lg sm:rounded-xl font-ui font-black text-[10px] sm:text-xs hover:bg-burgundy/5 active:scale-[0.98] transition-all"
                    aria-label="Add to cart"
                  >
                    <Plus className="w-3.5 h-3.5 sm:hidden" />
                    <span className="hidden sm:inline">ADD TO CART</span>
                    <span className="sm:hidden">CART</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** No-preview placeholder */
function NoPreviewCard({ onPurchase, onAddToCart, price, totalPages }: { onPurchase: () => void; onAddToCart?: () => void; price: number; totalPages: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-ui font-semibold text-slate-500">Preview Unavailable</span>
        </div>
      </div>
      <div className="p-6 sm:p-10 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 flex items-center justify-center">
          <img src="/images/edulaw-logo.png" alt="EduLaw" className="w-10 h-10 sm:w-12 sm:h-12 object-contain opacity-40" />
        </div>
        <div>
          <p className="font-display text-lg sm:text-xl text-slate-900 mb-2">Full Document — {totalPages} Pages</p>
          <p className="text-xs sm:text-sm text-slate-500 font-ui max-w-xs">
            Purchase to unlock the complete high-resolution PDF with instant download access.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onPurchase}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-burgundy text-parchment rounded-xl font-ui font-black shadow-xl shadow-burgundy/20 hover:bg-burgundy active:scale-[0.98] transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            BUY NOW — ₹{price}
          </button>
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 border-2 border-burgundy text-burgundy rounded-xl font-ui font-black hover:bg-burgundy/5 active:scale-[0.98] transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              ADD TO CART
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PDFPreview({
  pdfUrl,
  samplePdfUrl,
  previewImageUrl,
  previewImageUrls,
  totalPages,
  hasAccess,
  onPurchase,
  onAddToCart,
  price,
}: PDFPreviewProps) {
  const [numPages, setNumPages]   = useState<number | null>(null);
  const [zoom, setZoom]           = useState(100);
  const [isError, setIsError]     = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle responsive width for the PDF Page
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Subtract padding (p-4 = 32px, sm:p-8 = 64px)
        const padding = window.innerWidth < 640 ? 32 : 64;
        setContainerWidth(containerRef.current.clientWidth - padding);
      }
    };

    updateWidth();
    // Use ResizeObserver for more reliable width tracking
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);

    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      observer.disconnect();
    };
  }, []);

  // ── Logic determining what to show ───────────────────────────────────────
  const hasPreviews = (previewImageUrls && previewImageUrls.length > 0) || previewImageUrl;
  if (!hasAccess && hasPreviews && !samplePdfUrl) {
    const imageUrls = previewImageUrls && previewImageUrls.length > 0 
      ? previewImageUrls 
      : (previewImageUrl ? [previewImageUrl] : []);
      
    return (
      <ImagePreview
        imageUrls={imageUrls}
        onPurchase={onPurchase}
        onAddToCart={onAddToCart}
        price={price}
        totalPages={totalPages}
      />
    );
  }

  // Never expose the full pdfUrl to users without access — only show samplePdfUrl
  const activePdf = hasAccess ? pdfUrl : samplePdfUrl;

  if (!activePdf) {
    return (
      <NoPreviewCard onPurchase={onPurchase} onAddToCart={onAddToCart} price={price} totalPages={totalPages} />
    );
  }

  const isViewingSample = !hasAccess && !!samplePdfUrl;
  const previewLimit = 5;
  
  const visiblePages = Array.from(
    { 
      length: hasAccess || isViewingSample 
        ? (numPages || totalPages) 
        : Math.min(numPages || totalPages, previewLimit + 1) 
    },
    (_, i) => i + 1,
  );

  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[500px] sm:h-[800px] relative"
    >
      {/* Toolbar - Wrapped for small screens */}
      <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 border-b border-slate-200 bg-slate-50 z-50 shrink-0 shadow-sm font-ui gap-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-burgundy" />
            <span className="font-ui text-[10px] sm:text-sm font-semibold text-burgundy uppercase tracking-wider">
              {isViewingSample ? 'Sample PDF' : 'Preview'}
            </span>
          </div>
          {!hasAccess && !isViewingSample && (
            <span className="font-ui text-[10px] text-slate-400 font-medium whitespace-nowrap">
              Pages 1–5
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 bg-white px-1 sm:px-2 py-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1 sm:p-1.5 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-900"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="font-ui text-[10px] sm:text-xs w-8 sm:w-10 text-center font-medium">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-1 sm:p-1.5 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-900"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="relative flex-1 bg-slate-100/50 overflow-y-auto scroll-smooth p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-sm"
            >
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-slate-900 mb-4" />
              <p className="font-ui text-xs sm:text-sm text-slate-900 font-bold animate-pulse">Initializing Viewer...</p>
            </motion.div>
          )}

          {isError ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center px-6 h-full"
            >
              <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mb-4" />
              <h3 className="font-display text-lg sm:text-xl text-slate-900 mb-2">Preview Unavailable</h3>
              <p className="font-ui text-xs sm:text-sm text-slate-500 max-w-xs">
                We couldn't load the real-time preview. Purchase to unlock.
              </p>
            </motion.div>
          ) : (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                <p className="text-xs font-ui text-slate-400">Loading preview…</p>
              </div>
            }>
            <div
              className="flex flex-col items-center gap-10 transition-transform duration-300 origin-top pb-20"
              style={{ transform: `scale(${zoom / 100})` } as React.CSSProperties}
            >
              <Document
                file={activePdf}
                onLoadSuccess={({ numPages: n }) => { setNumPages(n); setIsLoading(false); }}
                onLoadError={() => { setIsError(true); setIsLoading(false); }}
                loading={null}
              >
                {visiblePages.map((pageNumber) => {
                  const isLocked = !hasAccess && !isViewingSample && pageNumber > previewLimit;
                  return (
                    <div
                      key={pageNumber}
                      className="relative mb-8 shadow-2xl ring-1 ring-black/5 bg-white overflow-hidden group"
                    >
                      <div className={isLocked ? 'blur-[8px] grayscale pointer-events-none select-none opacity-40' : ''}>
                        <Page
                          pageNumber={pageNumber}
                          width={containerWidth || 800}
                          loading={
                            <div className="aspect-[1/1.4] bg-slate-50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                            </div>
                          }
                          devicePixelRatio={Math.min(2, window.devicePixelRatio)}
                          renderAnnotationLayer={false}
                          renderTextLayer={!isLocked}
                        />
                      </div>

                      <LogoWatermark />

                      <div className="absolute top-4 right-4 bg-black/5 backdrop-blur-md px-2 py-1 rounded text-[10px] font-ui text-black/40 z-20 font-bold">
                        PAGE {pageNumber}
                      </div>

                      {isLocked && (
                        <div className="absolute inset-0 z-30 bg-gradient-to-b from-white/20 to-white/95 flex flex-col items-center justify-center p-4 sm:p-8 text-center backdrop-blur-[1px]">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full"
                          >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-burgundy" />
                            </div>
                            <h3 className="font-display text-xl sm:text-2xl text-slate-900 font-bold mb-3 sm:mb-4">Unlock Full Access</h3>
                            <p className="text-slate-500 font-ui text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
                              You've reached the free preview limit. Unlock all {totalPages} high-resolution pages now.
                            </p>
                            <div className="flex flex-col gap-3">
                              <button
                                onClick={onPurchase}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-burgundy text-parchment rounded-xl font-ui font-black shadow-xl shadow-burgundy/20 hover:bg-burgundy active:scale-[0.98] transition-all"
                              >
                                <ShoppingCart className="w-5 h-5" />
                                BUY NOW — ₹{price}
                              </button>
                              {onAddToCart && (
                                <button
                                  onClick={onAddToCart}
                                  className="w-full flex items-center justify-center gap-3 py-4 border-2 border-burgundy text-burgundy rounded-xl font-ui font-black hover:bg-burgundy/5 active:scale-[0.98] transition-all"
                                >
                                  <ShoppingCart className="w-5 h-5" />
                                  ADD TO CART
                                </button>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Document>
            </div>
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
