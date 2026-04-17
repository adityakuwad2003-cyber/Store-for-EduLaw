import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Award, RefreshCw, Copy, Check, Bookmark, BookMarked } from 'lucide-react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useQuizDaily } from '../../hooks/useDailyContent';
import {
  IG_GRADIENT, rrPath, drawBadge, drawDivider,
  drawBaseBackground, shareFile,
} from '../../lib/playgroundShare';
import { SubtleHook } from './SubtleHook';

const subjectColors: Record<string, string> = {
  'Constitutional Law': 'bg-burgundy/10 text-burgundy',
  'Fundamental Rights': 'bg-purple-100 text-purple-700',
  'Criminal Law':       'bg-red-100 text-red-700',
  'Criminal Procedure': 'bg-orange-100 text-orange-700',
  'Family Law':         'bg-pink-100 text-pink-700',
  'Environmental Law':  'bg-green-100 text-green-700',
  'Labour & Gender Law':'bg-teal-100 text-teal-700',
  'Right to Life':      'bg-blue-100 text-blue-700',
  'Gender / Rights':    'bg-indigo-100 text-indigo-700',
  'Religion & Gender':  'bg-amber-100 text-amber-700',
  'Constitutional Law / IT': 'bg-cyan-100 text-cyan-700',
  'Constitutional Law / Rights': 'bg-rose-100 text-rose-700',
  'Freedom of Speech':  'bg-sky-100 text-sky-700',
};

async function generateQuizStoryCard(score: number, total: number): Promise<Blob | null> {
  const W = 1080, H = 1920, PAD = 72;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const raw = canvas.getContext('2d');
  if (!raw) return null;
  const ctx: CanvasRenderingContext2D = raw;
  let Y = await drawBaseBackground(ctx, W, H);

  drawBadge(ctx, 'QUIZ RESULT', W / 2, Y + 28); Y += 80;

  // Circular score ring
  const cx = W / 2, cy = Y + 300, R = 280, LW = 36;
  ctx.strokeStyle = 'rgba(13,13,13,0.08)';
  ctx.lineWidth = LW;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  const pct = score / total;
  const goldArc = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
  goldArc.addColorStop(0, '#C9A84C'); goldArc.addColorStop(1, '#E8C97A');
  ctx.strokeStyle = goldArc;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // Score number inside ring
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 220px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(`${score}`, cx, cy + 76);
  ctx.fillStyle = 'rgba(13,13,13,0.45)'; ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText(`out of ${total}`, cx, cy + 148);
  Y = cy + R + 60;

  // Motivational message
  const msg = pct === 1 ? '🏆 Perfect Score!' : pct >= 0.8 ? '🎯 Excellent Work!' : pct >= 0.6 ? '👍 Great Job!' : '📚 Keep Practising!';
  ctx.fillStyle = '#0D0D0D'; ctx.font = 'bold 66px Georgia, serif';
  ctx.textAlign = 'center'; ctx.fillText(msg, W / 2, Y); Y += 100;

  // Progress bar
  const barW = W - PAD * 2, barH = 26;
  ctx.fillStyle = 'rgba(13,13,13,0.08)';
  rrPath(ctx, PAD, Y, barW, barH, 13); ctx.fill();
  const fillW = Math.max(barH, pct * barW);
  const goldG = ctx.createLinearGradient(PAD, 0, PAD + fillW, 0);
  goldG.addColorStop(0, '#C9A84C'); goldG.addColorStop(1, '#E8C97A');
  ctx.fillStyle = goldG; rrPath(ctx, PAD, Y, fillW, barH, 13); ctx.fill();
  Y += 60;

  ctx.fillStyle = 'rgba(13,13,13,0.55)'; ctx.font = '36px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('questions answered correctly', W / 2, Y); Y += 80;

  drawDivider(ctx, W, Y, PAD); Y += 60;
  ctx.fillStyle = 'rgba(13,13,13,0.60)'; ctx.font = '38px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('🎓 Challenge your classmates!', W / 2, Y); Y += 64;
  ctx.fillStyle = '#C9A84C'; ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillText('theedulaw.in/legal-playground', W / 2, Y); Y += 56;

  ctx.fillStyle = 'rgba(13,13,13,0.35)'; ctx.font = '26px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('Explore more at theedulaw.in', W / 2, Math.min(Y, H - 90));
  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
}

export function QuizOfTheDay() {
  const questions = useQuizDaily();
  const [current, setCurrent]   = useState(0);
  const [answered, setAnswered] = useState<boolean[]>(Array(questions.length).fill(false));
  const [choices, setChoices]   = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showAll, setShowAll]   = useState(false);
  const [quizShareBusy, setQuizShareBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toggle, isBookmarked } = useBookmarks();

  const handleCopyQuestion = useCallback((q: typeof questions[number]) => {
    const text = `Q: ${q.q}\n\nCorrect Answer: ${q.options[q.correct]}\n\nExplanation: ${q.explanation}\n\n[${q.subject}]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(q.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const q = questions[current];
  const isAnswered = answered[current];
  const userChoice = choices[current];
  const score = choices.filter((c, i) => c === questions[i].correct).length;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    const newAnswered = [...answered]; newAnswered[current] = true; setAnswered(newAnswered);
    const newChoices  = [...choices];  newChoices[current]  = idx;  setChoices(newChoices);
  };

  const handleQuizShare = async () => {
    setQuizShareBusy(true);
    try {
      const blob = await generateQuizStoryCard(score, questions.length);
      if (blob) await shareFile(new File([blob], 'edulaw-daily-quiz.png', { type: 'image/png' }), `Quiz Result: ${score}/${questions.length}`);
    } catch (_) {}
    finally { setQuizShareBusy(false); }
  };

  const allDone = answered.every(Boolean);

  return (
    <div className="bg-white border border-ink/10 rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-ink/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="font-ui font-black text-sm text-ink">Daily Quiz</p>
            <p className="text-[10px] font-ui text-mutedgray">5 questions · resets at midnight</p>
          </div>
        </div>
        {allDone && (
          <div className="px-3 py-1.5 bg-gold/10 rounded-xl text-center">
            <p className="text-[10px] font-ui text-gold font-black uppercase tracking-widest">Score</p>
            <p className="font-display text-lg text-gold leading-none">{score}/5</p>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-6 py-3 border-b border-ink/5 overflow-x-auto hide-scrollbar">
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Question ${i + 1}`}
            className={`h-2 rounded-full transition-all flex-shrink-0 ${i === current ? 'w-6' : 'w-2'} ${answered[i] ? choices[i] === questions[i].correct ? 'bg-green-400' : 'bg-red-400' : 'bg-ink/10'}`}
          />
        ))}
        <span className="ml-auto text-[10px] font-ui text-mutedgray font-bold whitespace-nowrap">{current + 1} / {questions.length}</span>
      </div>

      {/* Question */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${subjectColors[q.subject] ?? 'bg-slate-100 text-slate-600'}`}>{q.subject}</span>
        </div>
        <p className="font-display text-lg text-ink leading-snug mb-5 text-balance">{q.q}</p>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let cls = 'border-ink/10 bg-parchment/50 text-ink/70 hover:border-gold/50 hover:bg-gold/5 cursor-pointer';
            if (isAnswered) {
              if (i === q.correct) cls = 'border-green-400 bg-green-50 text-green-800 cursor-default';
              else if (i === userChoice) cls = 'border-red-400 bg-red-50 text-red-800 cursor-default';
              else cls = 'border-ink/5 bg-white/50 text-ink/30 cursor-default';
            }
            return (
              <button key={i} onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-ui text-sm font-medium transition-all flex items-center gap-3 ${cls}`}
              >
                <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {isAnswered && i === q.correct && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                {isAnswered && i === userChoice && i !== q.correct && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gold/5 border border-gold/20 rounded-2xl"
          >
            <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-1.5">Explanation</p>
            <p className="font-body text-sm text-ink/80 leading-relaxed">{q.explanation}</p>
            <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gold/15">
              <button onClick={() => handleCopyQuestion(q)} title="Copy question & explanation" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gold/10 transition-colors text-[10px] font-ui text-ink/50">
                {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === q.id ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => toggle(q.id)} title={isBookmarked(q.id) ? 'Remove bookmark' : 'Save question'} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gold/10 transition-colors text-[10px] font-ui text-ink/50">
                {isBookmarked(q.id) ? <BookMarked className="w-3.5 h-3.5 text-gold" /> : <Bookmark className="w-3.5 h-3.5" />}
                {isBookmarked(q.id) ? 'Saved' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0}
            className="flex-1 py-3 border border-ink/10 rounded-xl font-ui text-xs font-bold text-ink/60 hover:bg-ink hover:text-white disabled:opacity-30 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(p => p + 1)}
              className="flex-1 py-3 bg-burgundy text-white rounded-xl font-ui text-xs font-bold hover:bg-burgundy-light transition-colors flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setShowAll(v => !v)}
              className="flex-1 py-3 bg-gold text-ink rounded-xl font-ui text-xs font-bold hover:bg-gold/80 transition-colors flex items-center justify-center gap-2"
            >
              {showAll ? 'Hide' : 'See All'} <Award className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Share score once all answered */}
        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
             <SubtleHook textToMatch={questions[0].subject} />
            <button
              onClick={handleQuizShare}
              disabled={quizShareBusy}
              style={{ background: IG_GRADIENT }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-ui font-black uppercase tracking-widest text-[11px] text-white disabled:opacity-50 active:scale-95 transition-transform"
            >
              {quizShareBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>📱</span>}
              {quizShareBusy ? 'Generating…' : 'Share Score as IG Story'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
