import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, Lock, Eye, CheckCircle, ShoppingCart, Loader2, AlertCircle 
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFPreviewProps {
  pdfUrl: string;
  totalPages: number;
  hasAccess: boolean;
  onPurchase: () => void;
  price: number;
}

export function PDFPreview({ 
  pdfUrl,
  totalPages, 
  hasAccess, 
  onPurchase,
  price 
}: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError() {
    setIsError(true);
    setIsLoading(false);
  }

  // Previews are limited to the first 5 pages for unauthenticated users
  const previewLimit = 5;
  const visiblePages = Array.from(
    { length: hasAccess ? (numPages || totalPages) : Math.min(numPages || totalPages, previewLimit + 1) }, 
    (_, i) => i + 1
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-parchment-dark flex flex-col h-[800px] relative">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-parchment-dark bg-gradient-to-r from-parchment to-parchment-dark z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-parchment-dark shadow-sm">
            <Eye className="w-4 h-4 text-[#6B1E2E]" />
            <span className="font-ui text-sm font-semibold text-[#6B1E2E]">REAL PREVIEW</span>
          </div>
          {!hasAccess && (
            <span className="font-ui text-xs text-mutedgray hidden sm:inline">
              Limited Access: Pages 1-{previewLimit}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-parchment-dark lg:scale-100 scale-90">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              title="Zoom Out"
              className="p-1.5 hover:bg-parchment rounded transition-colors text-mutedgray hover:text-ink disabled:opacity-30"
              disabled={isLoading || isError}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-ui text-xs w-10 text-center font-medium">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              title="Zoom In"
              className="p-1.5 hover:bg-parchment rounded transition-colors text-mutedgray hover:text-ink disabled:opacity-30"
              disabled={isLoading || isError}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrolling PDF Viewer Container */}
      <div className="relative flex-1 bg-parchment-dark/30 overflow-y-auto scroll-smooth custom-scrollbar p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-parchment/50 z-20"
            >
              <Loader2 className="w-10 h-10 animate-spin text-[#6B1E2E] mb-4" />
              <p className="font-ui text-sm text-[#6B1E2E] animate-pulse">Loading secure preview...</p>
            </motion.div>
          )}

          {isError ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center px-6"
            >
              <AlertCircle className="w-12 h-12 text-burgundy mb-4" />
              <h3 className="font-display text-xl text-ink mb-2">Preview Unavailable</h3>
              <p className="font-body text-sm text-mutedgray max-w-sm">
                We couldn't load the real-time preview for this document. You can still purchase to download the full version.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 font-ui text-sm text-[#6B1E2E] hover:underline"
              >
                Try Refreshing
              </button>
            </motion.div>
          ) : (
            <div 
              className="flex flex-col items-center gap-10 transition-transform duration-300 origin-top pb-20"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
              >
                {visiblePages.map((pageNumber) => {
                  const isLocked = pageNumber > previewLimit && !hasAccess;
                  
                  return (
                    <div 
                      key={pageNumber} 
                      className="relative mb-8 shadow-2xl ring-1 ring-black/5 bg-white overflow-hidden group min-h-[500px]"
                    >
                      {/* Real PDF Page */}
                      <div className={isLocked ? 'blur-[6px] grayscale pointer-events-none select-none opacity-40' : ''}>
                        <Page 
                          pageNumber={pageNumber} 
                          width={800}
                          loading={
                            <div className="w-[800px] h-[1100px] bg-slate-50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                            </div>
                          }
                          devicePixelRatio={Math.min(2, window.devicePixelRatio)} // Optimize for performance
                          renderAnnotationLayer={false}
                          renderTextLayer={!isLocked}
                        />
                      </div>

                      {/* Professional Watermark Overlay */}
                      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden">
                        <div className="relative w-full h-full flex items-center justify-center opacity-[0.08] rotate-[-45deg] select-none">
                          <div className="text-[#6B1E2E] font-display text-6xl tracking-[0.2em] whitespace-nowrap uppercase">
                            EDULAW PREVIEW
                          </div>
                          {/* Sub-stamps for better protection */}
                          <div className="absolute top-1/4 left-1/4 text-[#6B1E2E] font-ui text-sm tracking-widest opacity-40">EDULAW.IN</div>
                          <div className="absolute bottom-1/4 right-1/4 text-[#6B1E2E] font-ui text-sm tracking-widest opacity-40">PROPERTY OF THE EDULAW</div>
                        </div>
                      </div>

                      {/* Page Counter */}
                      <div className="absolute top-4 right-4 bg-black/5 backdrop-blur-md px-2 py-1 rounded text-[10px] font-ui text-black/40 z-20 font-bold group-hover:bg-black/10 transition-colors">
                        PDF PAGE {pageNumber}
                      </div>

                      {/* Lock Screen for page 6 */}
                      {isLocked && (
                        <div className="absolute inset-0 z-30 bg-gradient-to-b from-white/20 to-white/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[2px]">
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-white/95 p-10 rounded-2xl shadow-[0_32px_64px_rgba(107,30,46,0.15)] border border-[#6B1E2E]/10 max-w-md w-full ring-1 ring-black/5"
                          >
                            <div className="w-20 h-20 bg-[#6B1E2E]/5 rounded-full flex items-center justify-center mx-auto mb-8">
                              <Lock className="w-10 h-10 text-[#6B1E2E]" />
                            </div>
                            <h3 className="font-display text-2xl text-ink mb-4 tracking-tight">Access Restricted</h3>
                            <p className="font-body text-sm text-mutedgray mb-10 leading-relaxed">
                              You've reached the end of the free preview. Purchase the full document to unlock all <b>{totalPages} pages</b> of high-quality legal notes.
                            </p>
                            
                            <div className="space-y-4">
                              <button
                                onClick={onPurchase}
                                className="w-full py-4 bg-[#6B1E2E] hover:bg-[#8B2E42] text-white rounded-xl font-ui font-bold shadow-xl shadow-[#6B1E2E]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                              >
                                <ShoppingCart className="w-5 h-5" />
                                UNLOCK FULL PDF — ₹{price}
                              </button>
                              <div className="flex items-center justify-center gap-6 pt-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-ui text-mutedgray uppercase tracking-wider">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Secure SSL
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-ui text-mutedgray uppercase tracking-wider">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-600" /> High Res
                                </span>
                              </div>
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
