import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, Lock, Eye, CheckCircle, ShoppingCart, Loader2, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFPreviewProps {
  /** Full PDF URL — used only after purchase (hasAccess = true) */
  pdfUrl?: string;
  /** Presigned R2 URL for the admin-uploaded preview image */
  previewImageUrl?: string;
  totalPages: number;
  hasAccess: boolean;
  onPurchase: () => void;
  price: number;
}

/** EduLaw logo watermark overlay — 10% opacity, centred */
function LogoWatermark() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center select-none">
      <img
        src="/images/edulaw-logo.png"
        alt=""
        aria-hidden="true"
        className="w-2/3 max-w-xs object-contain opacity-[0.10]"
        draggable={false}
      />
    </div>
  );
}

/** Image-based preview (no react-pdf needed) with watermark + lock overlay */
function ImagePreview({
  imageUrl,
  onPurchase,
  price,
  totalPages,
}: {
  imageUrl: string;
  onPurchase: () => void;
  price: number;
  totalPages: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 z-50 shrink-0 shadow-sm font-ui">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Eye className="w-4 h-4 text-burgundy" />
            <span className="font-ui text-sm font-semibold text-burgundy">SAMPLE PREVIEW</span>
          </div>
          <span className="font-ui text-xs text-slate-400 hidden sm:inline">
            Free preview · {totalPages} pages available after purchase
          </span>
        </div>
      </div>

      {/* Preview image with watermark */}
      <div className="relative bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt="Note preview"
          className="w-full object-contain max-h-[600px]"
          draggable={false}
        />
        <LogoWatermark />

        {/* Gradient fade + lock CTA */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end">
          <div className="w-full px-6 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-burgundy" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-display text-slate-900 font-bold">Unlock all {totalPages} pages</p>
                <p className="text-xs text-slate-500 font-ui mt-0.5">One-time purchase · Instant download · Lifetime access</p>
              </div>
              <button
                onClick={onPurchase}
                className="shrink-0 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-ui font-black text-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy — ₹{price}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 py-3 bg-slate-50 border-t border-slate-100">
        {[
          { icon: CheckCircle, label: 'Secure SSL' },
          { icon: CheckCircle, label: 'High Res PDF' },
          { icon: CheckCircle, label: 'Instant Access' },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] font-ui text-slate-400 uppercase tracking-wide">
            <Icon className="w-3.5 h-3.5 text-green-500" /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** No-preview placeholder */
function NoPreviewCard({ onPurchase, price, totalPages }: { onPurchase: () => void; price: number; totalPages: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-ui font-semibold text-slate-500">Preview Unavailable</span>
        </div>
      </div>
      <div className="p-10 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
          <img src="/images/edulaw-logo.png" alt="EduLaw" className="w-12 h-12 object-contain opacity-40" />
        </div>
        <div>
          <p className="font-display text-xl text-slate-900 mb-2">Full Document — {totalPages} Pages</p>
          <p className="text-sm text-slate-500 font-ui max-w-sm">
            Purchase to unlock the complete high-resolution PDF with instant download access.
          </p>
        </div>
        <button
          onClick={onPurchase}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-ui font-black shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          UNLOCK FULL PDF — ₹{price}
        </button>
        <div className="flex items-center gap-6">
          {['Secure SSL', 'High Res', 'Lifetime Access'].map(t => (
            <span key={t} className="flex items-center gap-1.5 text-[10px] font-ui text-slate-400 uppercase tracking-wide">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PDFPreview({
  pdfUrl,
  previewImageUrl,
  totalPages,
  hasAccess,
  onPurchase,
  price,
}: PDFPreviewProps) {
  const [numPages, setNumPages]   = useState<number | null>(null);
  const [zoom, setZoom]           = useState(100);
  const [isError, setIsError]     = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ── If admin uploaded a preview image and user hasn't purchased ──────────
  if (!hasAccess && previewImageUrl) {
    return (
      <ImagePreview
        imageUrl={previewImageUrl}
        onPurchase={onPurchase}
        price={price}
        totalPages={totalPages}
      />
    );
  }

  // ── No PDF URL available ─────────────────────────────────────────────────
  if (!pdfUrl) {
    return (
      <NoPreviewCard onPurchase={onPurchase} price={price} totalPages={totalPages} />
    );
  }

  // ── Full PDF viewer (purchased user OR pdf available) ────────────────────
  const previewLimit = 5;
  const visiblePages = Array.from(
    { length: hasAccess ? (numPages || totalPages) : Math.min(numPages || totalPages, previewLimit + 1) },
    (_, i) => i + 1,
  );

  return (
    <div 
      className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[800px] relative"
      style={{ '--preview-zoom': zoom / 100 } as any}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 z-50 shrink-0 shadow-sm font-ui">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Eye className="w-4 h-4 text-burgundy" />
            <span className="font-ui text-sm font-semibold text-burgundy">REAL PREVIEW</span>
          </div>
          {!hasAccess && (
            <span className="font-ui text-xs text-slate-400 hidden sm:inline font-medium">
              Limited: Pages 1–{previewLimit}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1.5 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-900 disabled:opacity-30"
            disabled={isLoading || isError}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-ui text-xs w-10 text-center font-medium">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-1.5 hover:bg-slate-50 rounded transition-colors text-slate-400 hover:text-slate-900 disabled:opacity-30"
            disabled={isLoading || isError}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
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
              <Loader2 className="w-10 h-10 animate-spin text-slate-900 mb-4" />
              <p className="font-ui text-sm text-slate-900 font-bold animate-pulse">Loading secure preview...</p>
            </motion.div>
          )}

          {isError ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center px-6 h-full"
            >
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="font-display text-xl text-slate-900 mb-2">Preview Unavailable</h3>
              <p className="font-ui text-sm text-slate-500 max-w-sm">
                We couldn't load the real-time preview. You can still purchase to download the full version.
              </p>
            </motion.div>
          ) : (
            <div
              className="flex flex-col items-center gap-10 transition-transform duration-300 origin-top pb-20"
              style={{ transform: `scale(var(--preview-zoom))` } as React.CSSProperties}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages: n }) => { setNumPages(n); setIsLoading(false); }}
                onLoadError={() => { setIsError(true); setIsLoading(false); }}
                loading={null}
              >
                {visiblePages.map((pageNumber) => {
                  const isLocked = pageNumber > previewLimit && !hasAccess;
                  return (
                    <div
                      key={pageNumber}
                      className="relative mb-8 shadow-2xl ring-1 ring-black/5 bg-white overflow-hidden group min-h-[500px]"
                    >
                      <div className={isLocked ? 'blur-[6px] grayscale pointer-events-none select-none opacity-40' : ''}>
                        <Page
                          pageNumber={pageNumber}
                          width={800}
                          loading={
                            <div className="w-[800px] h-[1100px] bg-slate-50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                            </div>
                          }
                          devicePixelRatio={Math.min(2, window.devicePixelRatio)}
                          renderAnnotationLayer={false}
                          renderTextLayer={!isLocked}
                        />
                      </div>

                      {/* 10% opacity logo watermark on every page */}
                      <LogoWatermark />

                      {/* Page number badge */}
                      <div className="absolute top-4 right-4 bg-black/5 backdrop-blur-md px-2 py-1 rounded text-[10px] font-ui text-black/40 z-20 font-bold">
                        PAGE {pageNumber}
                      </div>

                      {/* Lock overlay for page 6+ */}
                      {isLocked && (
                        <div className="absolute inset-0 z-30 bg-gradient-to-b from-white/20 to-white/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[1px]">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-white p-10 rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full"
                          >
                            <div className="w-20 h-20 bg-burgundy/5 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Lock className="w-10 h-10 text-burgundy" />
                            </div>
                            <h3 className="font-display text-2xl text-slate-900 mb-3">Access Restricted</h3>
                            <p className="font-ui text-sm text-slate-500 mb-8 leading-relaxed">
                              You've reached the end of the free preview. Purchase the full document to unlock all <b>{totalPages} pages</b>.
                            </p>
                            <button
                              onClick={onPurchase}
                              className="w-full py-4 bg-slate-900 text-white rounded-xl font-ui font-black shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                              <ShoppingCart className="w-5 h-5" />
                              UNLOCK FULL PDF — ₹{price}
                            </button>
                            <div className="flex items-center justify-center gap-6 pt-4">
                              {['Secure SSL', 'High Res', 'Instant Access'].map(t => (
                                <span key={t} className="flex items-center gap-1.5 text-[10px] font-ui text-slate-400 uppercase tracking-wide">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {t}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Document>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PDFPreview;
