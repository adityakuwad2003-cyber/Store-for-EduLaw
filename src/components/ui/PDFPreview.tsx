import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, Lock, Eye, CheckCircle, ShoppingCart 
} from 'lucide-react';

interface PDFPreviewProps {
  totalPages: number;
  hasAccess: boolean;
  onPurchase: () => void;
  price: number;
}

// BNSS Content for preview pages
const bnssContent = {
  page1: {
    title: "BNSS - BHARATIYA NAGARIK SURAKSHA SANHITA, 2023",
    subtitle: "Complete Notes with Comparative Analysis",
    content: [
      { type: 'heading', text: 'CHAPTER I - PRELIMINARY' },
      { type: 'section', text: 'Section 1: Short title, extent and commencement' },
      { type: 'text', text: '(1) This Act may be called the Bharatiya Nagarik Suraksha Sanhita, 2023.' },
      { type: 'text', text: '(2) It extends to the whole of India except the State of Jammu and Kashmir.' },
      { type: 'text', text: '(3) It shall come into force on such date as the Central Government may, by notification in the Official Gazette, appoint.' },
      { type: 'highlight', text: '⚖️ KEY CHANGE: Replaces CrPC, 1973 with modernized procedures' },
      { type: 'divider' },
      { type: 'heading', text: 'IMPORTANT DEFINITIONS' },
      { type: 'definition', term: 'Bailable Offence', def: 'An offence which is shown as bailable in the First Schedule or which is made bailable by any other law.' },
      { type: 'definition', term: 'Non-Bailable Offence', def: 'Any other offence other than a bailable offence.' },
      { type: 'definition', term: 'Cognizable Offence', def: 'An offence for which a police officer may arrest without warrant.' },
    ]
  },
  page2: {
    title: "ARREST PROCEDURES - SECTION 35-60",
    subtitle: "Rights of Arrested Person",
    content: [
      { type: 'heading', text: 'SECTION 35: Protection of members of Armed Forces' },
      { type: 'text', text: 'No prosecution against any member of Armed Forces for any act done in discharge of official duty without sanction of Central Government.' },
      { type: 'divider' },
      { type: 'heading', text: 'ARREST WITHOUT WARRANT (Section 41)' },
      { type: 'bullet', text: 'Person concerned in cognizable offence' },
      { type: 'bullet', text: 'Person against whom reasonable complaint made' },
      { type: 'bullet', text: 'Person possessing stolen property' },
      { type: 'bullet', text: 'Person obstructing police in execution of duty' },
      { type: 'highlight', text: '📋 NEW: Section 41A - Notice of Appearance before police officer' },
      { type: 'divider' },
      { type: 'heading', text: 'RIGHTS OF ARRESTED PERSON' },
      { type: 'bullet', text: 'Right to be informed of grounds of arrest (Section 50)' },
      { type: 'bullet', text: 'Right to consult legal practitioner (Section 50)' },
      { type: 'bullet', text: 'Right to be produced before Magistrate within 24 hours' },
      { type: 'bullet', text: 'Right to medical examination (Section 54)' },
    ]
  },
  page3: {
    title: "BAIL PROVISIONS - SECTION 478-485",
    subtitle: "Regular Bail, Anticipatory Bail & Interim Bail",
    content: [
      { type: 'heading', text: 'SECTION 478: Power to grant bail' },
      { type: 'text', text: 'When any person accused of a bailable offence is arrested or detained without warrant, he shall be released on bail by the officer in charge of the police station.' },
      { type: 'divider' },
      { type: 'heading', text: 'ANTICIPATORY BAIL (Section 482)' },
      { type: 'text', text: 'High Court or Court of Session may grant anticipatory bail if satisfied that:' },
      { type: 'bullet', text: 'Applicant has reason to believe he may be arrested' },
      { type: 'bullet', text: 'He has not been arrested before filing application' },
      { type: 'bullet', text: 'Public Interest does not require arrest' },
      { type: 'highlight', text: '⚠️ NEW: Limitation - Not available for offences punishable with death or life imprisonment' },
      { type: 'divider' },
      { type: 'heading', text: 'CONDITIONS FOR BAIL' },
      { type: 'bullet', text: 'Person shall make himself available for investigation' },
      { type: 'bullet', text: 'Shall not directly or indirectly make any inducement' },
      { type: 'bullet', text: 'Shall not leave India without previous permission' },
    ]
  },
  page4: {
    title: "INVESTIGATION PROCEDURE - SECTION 173-176",
    subtitle: "Police Investigation & Chargesheet",
    content: [
      { type: 'heading', text: 'SECTION 173: Report of police officer on completion of investigation' },
      { type: 'text', text: 'Every investigation shall be completed without unnecessary delay and as soon as it is completed:' },
      { type: 'bullet', text: 'Forward to Magistrate a police report in prescribed form' },
      { type: 'bullet', text: 'Attach all documents and evidence collected' },
      { type: 'bullet', text: 'Inform informant or victim of progress' },
      { type: 'divider' },
      { type: 'heading', text: 'TIME LIMIT FOR INVESTIGATION' },
      { type: 'text', text: 'Investigation must be completed within:' },
      { type: 'bullet', text: '60 days for offences punishable with imprisonment < 10 years' },
      { type: 'bullet', text: '90 days for offences punishable with death/life imprisonment' },
      { type: 'highlight', text: '📌 NEW: Section 176 - Right of victim to be heard at every stage' },
      { type: 'divider' },
      { type: 'heading', text: 'ZERO FIR' },
      { type: 'text', text: 'Police must register FIR irrespective of jurisdiction and transfer to appropriate police station within 24 hours.' },
    ]
  },
  locked: {
    title: "CONTINUE READING...",
    subtitle: "Purchase to unlock all pages",
    content: [
      { type: 'locked', text: 'Pages 5-180' },
    ]
  }
};

// Watermark component functionality merged into PageContent for better layering

// Page Content Renderer
function PageContent({ pageData, isBlurred }: { pageData: any; isBlurred?: boolean }) {
  return (
    <div className={`relative p-8 min-h-[600px] border-b border-parchment-dark bg-white transition-all duration-700 ${isBlurred ? 'blur-[8px] grayscale-[0.3]' : ''}`}>
      {/* Header */}
      <div className="border-b-2 border-[#6B1E2E] pb-4 mb-6">
        <h1 className="font-display text-xl text-[#6B1E2E]">{pageData.title}</h1>
        <p className="font-ui text-sm text-mutedgray mt-1">{pageData.subtitle}</p>
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        {pageData.content.map((item: any, idx: number) => {
          switch (item.type) {
            case 'heading':
              return (
                <h2 key={idx} className="font-display text-lg text-ink mt-6 first:mt-0">
                  {item.text}
                </h2>
              );
            case 'section':
              return (
                <h3 key={idx} className="font-ui font-semibold text-[#6B1E2E] text-sm">
                  {item.text}
                </h3>
              );
            case 'text':
              return (
                <p key={idx} className="font-body text-sm text-ink leading-relaxed">
                  {item.text}
                </p>
              );
            case 'bullet':
              return (
                <div key={idx} className="flex items-start gap-2 ml-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-2 flex-shrink-0" />
                  <p className="font-body text-sm text-ink">{item.text}</p>
                </div>
              );
            case 'highlight':
              return (
                <div key={idx} className="bg-gradient-to-r from-[#C9A84C]/20 to-transparent p-3 rounded-lg border-l-4 border-[#C9A84C] my-4">
                  <p className="font-ui text-sm text-[#6B1E2E] font-medium">{item.text}</p>
                </div>
              );
            case 'divider':
              return <hr key={idx} className="border-parchment-dark my-4" />;
            case 'definition':
              return (
                <div key={idx} className="bg-parchment/50 p-3 rounded-lg my-2">
                  <span className="font-ui font-semibold text-[#6B1E2E] text-sm">{item.term}:</span>
                  <span className="font-body text-sm text-ink ml-2">{item.def}</span>
                </div>
              );
            case 'locked':
              return (
                <div className="flex flex-col items-center justify-center py-12">
                  <Lock className="w-16 h-16 text-[#6B1E2E]/30 mb-4" />
                  <p className="font-display text-lg text-mutedgray">{item.text} Locked</p>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
      
      {/* Page footer */}
      <div className="mt-8 pt-4 border-t border-parchment-dark flex items-center justify-between">
        <span className="font-ui text-xs text-mutedgray">EduLaw.in - BNSS Complete Notes</span>
        <div className="flex items-center gap-2">
          <span className="font-ui text-xs text-[#C9A84C]">§</span>
          <span className="font-ui text-xs text-mutedgray">Bharatiya Nagarik Suraksha Sanhita</span>
        </div>
      </div>

      {/* Watermarked Logo - 20% Opacity */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden select-none">
        <div className="relative w-3/5 aspect-square opacity-[0.2] filter grayscale contrast-125">
          <img 
            src="/images/edulaw-logo.png" 
            alt="" 
            className="w-full h-full object-contain"
          />
          {/* Subtle tiling for anti-piracy */}
          <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-24 rotate-[-35deg] opacity-40">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="text-[#6B1E2E] font-display text-[10px] tracking-[0.5em] whitespace-nowrap">
                EDULAW • OFFICIAL PREVIEW
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PDFPreview({ 
  totalPages, 
  hasAccess, 
  onPurchase,
  price 
}: PDFPreviewProps) {
  const [zoom, setZoom] = useState(100);

  const getPageData = (page: number) => {
    switch (page) {
      case 1: return bnssContent.page1;
      case 2: return bnssContent.page2;
      case 3: return bnssContent.page3;
      case 4: return bnssContent.page4;
      default: return bnssContent.locked;
    }
  };

  // Generate page numbers to render
  const visiblePages = Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-parchment-dark flex flex-col h-[750px] relative">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-parchment-dark bg-gradient-to-r from-parchment to-parchment-dark z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-parchment-dark shadow-sm">
            <Eye className="w-4 h-4 text-[#6B1E2E]" />
            <span className="font-ui text-sm font-semibold text-[#6B1E2E]">SCROLLING PREVIEW</span>
          </div>
          <span className="font-ui text-xs text-mutedgray hidden sm:inline">
            Free Access: Pages 1-5
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-parchment-dark lg:scale-100 scale-90">
          <button
            onClick={() => setZoom(Math.max(60, zoom - 10))}
            title="Zoom Out"
            className="p-1.5 hover:bg-parchment rounded transition-colors text-mutedgray hover:text-ink"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-ui text-xs w-10 text-center font-medium">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(140, zoom + 10))}
            title="Zoom In"
            className="p-1.5 hover:bg-parchment rounded transition-colors text-mutedgray hover:text-ink"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrolling PDF Viewer Container */}
      <div className="relative flex-1 bg-parchment-dark/30 overflow-y-auto scroll-smooth custom-scrollbar p-4 sm:p-8">
        <div 
          className="flex flex-col items-center gap-8 transition-transform duration-300 origin-top"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {visiblePages.map((pageNumber) => {
            const isBlurred = pageNumber > 5 && !hasAccess;
            
            return (
              <div 
                key={pageNumber} 
                className="relative w-full max-w-[800px] shadow-2xl rounded-sm transform-gpu"
              >
                <PageContent pageData={getPageData(pageNumber)} isBlurred={isBlurred} />
                
                {/* Page Label */}
                <div className="absolute top-4 right-4 bg-ink/5 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-ui text-ink/40 z-30 font-medium">
                  PAGE {pageNumber}
                </div>

                {/* Lock Overlay for blurred pages */}
                {pageNumber === 6 && isBlurred && (
                  <div className="absolute inset-0 z-40 bg-white/10 backdrop-blur-[4px] flex flex-col items-center justify-start pt-32 px-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-[0_20px_50px_rgba(107,30,46,0.15)] border border-[#6B1E2E]/10 text-center max-w-md w-full"
                    >
                      <div className="w-16 h-16 bg-[#6B1E2E]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-[#6B1E2E]" />
                      </div>
                      <h3 className="font-display text-2xl text-ink mb-3 tracking-tight">Full Notes Locked</h3>
                      <p className="font-body text-sm text-mutedgray mb-8 leading-relaxed">
                        You've reached the end of the free preview. This comprehensive law note contains <b>{totalPages} pages</b> of detailed analysis.
                      </p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={onPurchase}
                          className="w-full py-4 bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] text-white rounded-xl font-ui font-bold shadow-xl shadow-[#6B1E2E]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          UNLOCK NOW — ₹{price}
                        </button>
                        <p className="text-[10px] font-ui text-mutedgray flex items-center justify-center gap-4">
                          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> SECURE PDF</span>
                          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> INSTANT DOWNLOAD</span>
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="h-20" /> {/* Bottom spacing */}
        </div>
      </div>
    </div>
  );
}

export default PDFPreview;
