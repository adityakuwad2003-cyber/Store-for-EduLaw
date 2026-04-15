import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Printer, ArrowLeft, CheckCircle, 
  AlertCircle, FileText
} from 'lucide-react';
import { mcqBooklets } from '@/data/mcqData';
import { premiumMcqBooklets } from '@/data/premiumMcqData';
import { SEO } from '@/components/SEO';

export default function QuestionPaper() {
  const { bookletId } = useParams<{ bookletId: string }>();
  const [showAnswers, setShowAnswers] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Combine data sources
  const allBooklets = [...mcqBooklets, ...premiumMcqBooklets];
  const booklet = allBooklets.find(b => b.id === bookletId);

  if (!booklet) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-burgundy mb-4 opacity-20" />
        <h1 className="font-display text-2xl text-ink mb-2">Question Paper Not Found</h1>
        <p className="font-body text-mutedgray mb-6">The requested mock test could not be located in our archives.</p>
        <Link to="/mock-tests" className="px-6 py-2 bg-burgundy text-parchment rounded-xl font-ui font-bold text-sm">
          Back to Mock Tests
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white text-ink">
      <SEO 
        title={`${booklet.title} — Printable Question Paper`}
        description={`Full ${booklet.totalQuestions}-question mock test paper for ${booklet.title}. Printable with watermark and answer key.`}
      />

      {/* ── CONTROL BAR (Hidden on Print) ─────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-ink/10 px-4 py-3 print:hidden transition-all duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/mock-tests" className="flex items-center gap-1.5 text-xs font-ui text-mutedgray hover:text-ink transition-colors">
            <ArrowLeft className="w-4 h-4" /> Exit to Mock Tests
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAnswers(!showAnswers)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-ui font-bold transition-all border ${
                showAnswers ? 'bg-burgundy text-parchment border-burgundy' : 'bg-white text-burgundy border-burgundy/30 hover:border-burgundy'
              }`}
            >
              {showAnswers ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {showAnswers ? 'Hide Answer Key' : 'Reveal Answer Key'}
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2 bg-ink text-parchment rounded-xl text-xs font-ui font-bold hover:bg-black transition-all shadow-lg shadow-ink/20"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── QUESTION PAPER ────────────────────────────────────────────────── */}
      <div 
        ref={printRef}
        className="relative max-w-[210mm] mx-auto my-8 p-[20mm] bg-white shadow-2xl print:shadow-none print:my-0 print:w-full min-h-[297mm]"
      >
        {/* WATERMARK (EduLaw) */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden select-none translate-y-20">
          <span className="font-display text-[14rem] md:text-[18rem] text-ink/[0.04] -rotate-45 uppercase tracking-[0.1em]">
            EduLaw
          </span>
        </div>

        {/* HEADER */}
        <header className="relative z-10 flex flex-col items-center text-center border-b-2 border-ink pb-8 mb-10">
          <div className="mb-4">
             <span className="font-display text-4xl text-ink tracking-tight uppercase">The EduLaw Archive</span>
             <p className="font-ui text-[10px] text-mutedgray uppercase tracking-[0.4em] mt-1">Institutional Excellence in Legal Learning</p>
          </div>
          <h1 className="font-display text-2xl text-burgundy mb-2">{booklet.title}</h1>
          <p className="font-body text-sm text-ink/60 mb-6 italic">{booklet.subtitle}</p>

          <div className="w-full grid grid-cols-3 gap-8 py-4 border-y border-ink/10 text-xs font-ui uppercase tracking-widest text-mutedgray">
            <div className="text-left font-bold">Time Allowed: {booklet.duration} mins</div>
            <div className="text-center font-bold">Total Marks: {booklet.totalMarks || booklet.totalQuestions}</div>
            <div className="text-right font-bold">Exam Type: {booklet.examType || 'Mock Test'}</div>
          </div>
        </header>

        {/* CANDIDATE INFO */}
        <section className="relative z-10 grid grid-cols-2 gap-10 mb-12 py-6 px-8 border border-ink/5 bg-parchment/10 rounded-2xl">
          <div className="space-y-4">
            <div className="flex flex-col gap-1 border-b border-ink/10 pb-1">
              <span className="text-[10px] font-ui text-mutedgray uppercase">Candidate Name</span>
              <div className="h-6" />
            </div>
            <div className="flex flex-col gap-1 border-b border-ink/10 pb-1">
              <span className="text-[10px] font-ui text-mutedgray uppercase">Roll Number</span>
              <div className="h-6" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-1 border-b border-ink/10 pb-1">
              <span className="text-[10px] font-ui text-mutedgray uppercase">Date of Examination</span>
              <div className="h-6" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-ui text-mutedgray uppercase">Signature</span>
              <div className="h-8 border-2 border-dashed border-ink/10 bg-white" />
            </div>
          </div>
        </section>

        {/* INSTRUCTIONS */}
        <section className="relative z-10 mb-12">
          <h2 className="font-ui font-black text-xs uppercase tracking-widest text-burgundy mb-4 border-b border-burgundy/10 pb-1 flex items-center gap-2">
             <AlertCircle className="w-3.5 h-3.5" /> General Instructions
          </h2>
          <ul className="space-y-2 text-xs font-body text-ink/70 leading-relaxed list-decimal pl-5">
            {booklet.paperInstructions?.map((inst, i) => (
              <li key={i}>{inst}</li>
            )) || (
              <>
                <li>All questions are compulsory and carry equal marks.</li>
                <li>Ensure your name and roll number are clearly filled.</li>
                <li>Shade only one option per question on the OMR sheet (if provided).</li>
                <li>There is no negative marking for this session.</li>
              </>
            )}
          </ul>
        </section>

        {/* QUESTIONS GRID */}
        <section className="relative z-10 space-y-12 mb-20">
          {booklet.questions.map((q, idx) => (
            <div key={q.id} className="break-inside-avoid">
              <div className="flex items-start gap-4 mb-5">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-ink text-parchment flex items-center justify-center font-display text-sm font-bold">
                  {idx + 1}
                </span>
                <p className="font-body text-[15px] leading-relaxed text-ink font-medium mt-1">
                  {q.question}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3 pl-12">
                {q.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-3 group">
                    <span className="w-6 h-6 rounded-full border border-ink/20 flex items-center justify-center text-[10px] font-ui font-bold text-ink group-hover:bg-ink group-hover:text-white transition-colors">
                      {opt.id}
                    </span>
                    <span className={`text-[13px] font-body text-ink/80 ${showAnswers && opt.id === q.correct ? 'font-bold underline decoration-burgundy decoration-2 underline-offset-4' : ''}`}>
                      {opt.text}
                    </span>
                  </div>
                ))}
              </div>
              
              {showAnswers && (
                <div className="mt-4 ml-12 bg-burgundy/5 border border-burgundy/10 p-3 rounded-xl">
                  <div className="text-[10px] font-ui font-black text-burgundy uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3" /> Correct Answer: {q.correct}
                  </div>
                  <p className="text-[12px] font-body text-ink/70 italic leading-relaxed">
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* FOOTER */}
        <footer className="relative z-10 pt-10 border-t border-ink/10 text-center">
          <p className="font-display text-xl text-ink/20 uppercase tracking-[0.5em] mb-4">— End of Question Paper —</p>
          <div className="text-[10px] font-ui text-mutedgray flex items-center justify-center gap-6">
            <span>© {new Date().getFullYear()} EduLaw Technologies</span>
            <span>Ref ID: EL-MOCK-{booklet.id.toUpperCase()}</span>
            <span>Page 1 of {Math.ceil(booklet.questions.length / 5)}</span>
          </div>
        </footer>

        {/* PRINT HIDE SECTIONS */}
        <div className={`mt-20 p-8 border-2 border-dashed border-burgundy/20 rounded-3xl bg-burgundy/5 transition-all ${showAnswers ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
           <h3 className="font-display text-xl text-burgundy mb-6 text-center">Final Answer Key</h3>
           <div className="grid grid-cols-10 gap-x-2 gap-y-4 text-center">
             {booklet.questions.map((q, i) => (
                <div key={q.id} className="flex flex-col gap-1 border border-burgundy/10 rounded-lg py-2">
                  <span className="text-[9px] font-ui text-mutedgray">{i + 1}</span>
                  <span className="text-sm font-display font-bold text-ink">{q.correct}</span>
                </div>
             ))}
           </div>
        </div>
      </div>

      {/* ── PRINT STYLES ──────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .min-h-screen { background: white; }
          @page { margin: 15mm; }
          button, .control-bar, .Link { display: none !important; }
          .print\\:hidden { display: none !important; }
          .shadow-2xl { box-shadow: none !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}
