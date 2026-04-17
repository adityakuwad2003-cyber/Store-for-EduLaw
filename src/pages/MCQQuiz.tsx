import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, CheckCircle2, XCircle,
  Trophy, RotateCcw, Home, BookOpen, Clock,
  Target, Lightbulb, ArrowLeft, AlertCircle, Award,
  Lock, Crown, Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from 'firebase/auth';
import { premiumMcqBooklets } from '@/data/premiumMcqData';
import { mcqBooklets, type MCQBooklet, type MCQQuestion } from '@/data/mcqData';
import { mockTests as notesMockTests } from '@/data/notes';
import { getNoteMCQs } from '@/lib/db';
import { MCQCertificate } from '@/components/ui/MCQCertificate';
import { SEO } from '@/components/SEO';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────────────────────────────

type QuizPhase = 'start' | 'quiz' | 'result';
type AnswerMap = Record<number, 'A' | 'B' | 'C' | 'D'>;

// ─── Helpers ───────────────────────────────────────────────────────────────

function getScoreLabel(pct: number) {
  if (pct >= 90) return { label: 'Distinction', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
  if (pct >= 75) return { label: 'First Class', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
  if (pct >= 60) return { label: 'Pass', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
  return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
}

function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return { seconds, fmt, reset: () => setSeconds(0) };
}

// ─── Option Button ──────────────────────────────────────────────────────────

interface OptionProps {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  selected: boolean;
  revealed: boolean;
  correct: boolean;
  onSelect: () => void;
}

function OptionButton({ id, text, selected, revealed, correct, onSelect }: OptionProps) {
  let style =
    'w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 font-ui text-sm transition-all duration-200 cursor-pointer ';

  if (!revealed) {
    style += selected
      ? 'border-burgundy bg-burgundy/8 text-burgundy'
      : 'border-ink/10 bg-white hover:border-gold/50 hover:bg-gold/5 text-ink';
  } else if (correct) {
    style += 'border-emerald-400 bg-emerald-50 text-emerald-800 cursor-default';
  } else if (selected && !correct) {
    style += 'border-red-400 bg-red-50 text-red-800 cursor-default';
  } else {
    style += 'border-ink/8 bg-white/50 text-ink/40 cursor-default';
  }

  return (
    <motion.button
      whileHover={!revealed ? { scale: 1.01 } : {}}
      whileTap={!revealed ? { scale: 0.99 } : {}}
      className={style}
      onClick={!revealed ? onSelect : undefined}
      disabled={revealed}
    >
      {/* Option letter badge */}
      <span
        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border mt-0.5
          ${!revealed
            ? selected ? 'bg-burgundy text-white border-burgundy' : 'border-ink/20 text-ink/50'
            : correct ? 'bg-emerald-500 text-white border-emerald-500'
            : selected ? 'bg-red-400 text-white border-red-400'
            : 'border-ink/15 text-ink/30'
          }`}
      >
        {id}
      </span>
      <span className="leading-snug">{text}</span>
      {/* Correct/wrong icon */}
      {revealed && correct && <CheckCircle2 className="ml-auto shrink-0 w-5 h-5 text-emerald-500 mt-0.5" />}
      {revealed && selected && !correct && <XCircle className="ml-auto shrink-0 w-5 h-5 text-red-400 mt-0.5" />}
    </motion.button>
  );
}

// ─── Start Screen ───────────────────────────────────────────────────────────

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

function StartScreen({
  booklet, onStart, isNoteMCQ, difficultyFilter, onDifficultyChange,
}: {
  booklet: MCQBooklet;
  onStart: () => void;
  isNoteMCQ?: boolean;
  difficultyFilter?: DifficultyFilter;
  onDifficultyChange?: (d: DifficultyFilter) => void;
}) {
  const DIFF_OPTIONS: { value: DifficultyFilter; label: string; color: string; bg: string }[] = [
    { value: 'all',    label: 'All 30',  color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
    { value: 'easy',   label: '🟢 Easy',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    { value: 'medium', label: '🟡 Medium', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
    { value: 'hard',   label: '🔴 Hard',   color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto text-center py-12 px-4"
    >
      <div className="text-6xl mb-6">{booklet.icon}</div>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mb-3">{booklet.title}</h1>
      <p className="font-body text-mutedgray mb-8">{booklet.subtitle}</p>

      {/* Difficulty selector — only for note-mcq booklets */}
      {isNoteMCQ && onDifficultyChange && (
        <div className="mb-8">
          <p className="text-[10px] font-ui font-black uppercase tracking-[0.2em] text-mutedgray mb-3">
            Choose Difficulty
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {DIFF_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onDifficultyChange(opt.value)}
                className={`px-4 py-2 rounded-full text-xs font-ui font-bold border transition-all ${
                  difficultyFilter === opt.value
                    ? `${opt.bg} ${opt.color} shadow-sm scale-105`
                    : 'bg-white border-ink/10 text-mutedgray hover:border-ink/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: BookOpen, label: 'Questions', value: booklet.totalQuestions },
          { icon: Clock, label: 'Duration', value: `${booklet.duration} min` },
          { icon: Target, label: 'Level', value: booklet.difficulty },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-ink/10 py-4 px-3 flex flex-col items-center gap-1">
            <Icon className="w-5 h-5 text-gold mb-1" />
            <span className="font-display text-xl text-ink">{value}</span>
            <span className="text-[10px] font-ui text-mutedgray uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-burgundy/5 border border-burgundy/15 rounded-2xl p-5 text-left mb-8">
        <h3 className="font-ui font-bold text-burgundy text-sm mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Instructions
        </h3>
        <ul className="space-y-2 text-sm font-body text-ink/70">
          <li>• Each question has one correct answer from 4 options</li>
          <li>• After selecting an option, the explanation is revealed immediately</li>
          <li>• You cannot change your answer once selected</li>
          <li>• Your score and detailed review are shown at the end</li>
        </ul>
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 bg-gradient-to-r from-burgundy to-burgundy-light text-parchment rounded-xl font-ui font-bold text-base hover:shadow-lg hover:shadow-burgundy/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        Start Quiz <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// ─── Question Card ──────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: MCQQuestion;
  index: number;
  total: number;
  selected: 'A' | 'B' | 'C' | 'D' | undefined;
  onSelect: (id: 'A' | 'B' | 'C' | 'D') => void;
  onNext: () => void;
  isLast: boolean;
  timerFmt: string;
  booklet: MCQBooklet;
}

function QuestionCard({
  question, index, total, selected, onSelect, onNext, isLast, timerFmt, booklet
}: QuestionCardProps) {
  const revealed = selected !== undefined;
  const pct = ((index) / total) * 100;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto px-4 py-6"
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-ink/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${booklet.colorFrom}, ${booklet.colorTo})` }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>
        <span className="text-xs font-ui text-mutedgray whitespace-nowrap">{index}/{total}</span>
        <div className="flex items-center gap-1 text-xs font-ui text-mutedgray">
          <Clock className="w-3.5 h-3.5" />{timerFmt}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 sm:p-6 mb-5">
        <p className="text-[10px] font-ui font-black text-gold uppercase tracking-widest mb-3">
          Question {index} of {total}
        </p>
        <p className="font-display text-lg sm:text-xl text-ink leading-snug">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-5">
        {question.options.map(opt => (
          <OptionButton
            key={opt.id}
            id={opt.id}
            text={opt.text}
            selected={selected === opt.id}
            revealed={revealed}
            correct={opt.id === question.correct}
            onSelect={() => onSelect(opt.id)}
          />
        ))}
      </div>

      {/* Explanation — shown after answering */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`rounded-2xl border p-4 mb-5 flex gap-3 ${
              selected === question.correct
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <Lightbulb className={`shrink-0 w-5 h-5 mt-0.5 ${
                selected === question.correct ? 'text-emerald-600' : 'text-amber-600'
              }`} />
              <div>
                <p className={`text-[10px] font-ui font-black uppercase tracking-widest mb-1.5 ${
                  selected === question.correct ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {selected === question.correct ? '✓ Correct!' : '✗ Incorrect — Explanation'}
                </p>
                <p className="text-sm font-body text-ink/80 leading-relaxed">{question.explanation}</p>
              </div>
            </div>

            <button
              onClick={onNext}
              className="w-full py-3.5 rounded-xl font-ui font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${booklet.colorFrom}, ${booklet.colorTo})`, color: '#F5F0E8' }}
            >
              {isLast ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && (
        <p className="text-center text-xs font-ui text-mutedgray mt-2">Select an option to reveal the answer</p>
      )}
    </motion.div>
  );
}

// ─── Result Screen ──────────────────────────────────────────────────────────

interface ResultScreenProps {
  booklet: MCQBooklet;
  answers: AnswerMap;
  totalSeconds: number;
  onRetry: () => void;
}

function ResultScreen({ booklet, answers, totalSeconds, onRetry }: ResultScreenProps) {
  const [reviewMode, setReviewMode] = useState(false);
  const [certName, setCertName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const correct = booklet.questions.filter(q => answers[q.id] === q.correct).length;
  const total = booklet.questions.length;
  const pct = Math.round((correct / total) * 100);
  const { label, color, bg } = getScoreLabel(pct);
  const timeTaken = `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;

  const certId = `EDU-${booklet.id.toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const downloadCertificate = async () => {
    if (!certName.trim()) {
      toast.error('Please enter your name to generate the certificate');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('Generating your official EduLaw certificate...');

    try {
      // Small timeout to ensure the certificate is rendered in the hidden container
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = document.getElementById('certificate-template');
      if (!element) throw new Error('Certificate template not found');

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#F5F0E8'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [842, 595] // A4 landscape at 96 DPI
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 842, 595);
      pdf.save(`EduLaw_Certificate_${certName.replace(/\s+/g, '_')}.pdf`);
      
      toast.success('Certificate downloaded successfully! You can now share it on LinkedIn.', { id: loadingToast });
    } catch (err) {
      console.error('Cert generation error:', err);
      toast.error('Failed to generate certificate. Please try again.', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      {!reviewMode ? (
        <>
          {/* Trophy */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${booklet.colorFrom}, ${booklet.colorTo})` }}
            >
              <Trophy className="w-12 h-12 text-gold" />
            </motion.div>
            <h2 className="font-display text-3xl text-ink mb-2">Quiz Complete!</h2>
            <p className="font-body text-mutedgray">{booklet.title}</p>
          </div>

          {/* Score card */}
          <div className="bg-white rounded-3xl border border-ink/10 shadow-lg p-6 sm:p-8 mb-6">
            {/* Big score */}
            <div className="text-center mb-6">
              <div className="font-display text-6xl sm:text-7xl text-ink mb-1">
                {correct}<span className="text-2xl text-mutedgray">/{total}</span>
              </div>
              <div className="font-display text-4xl text-gold">{pct}%</div>
              <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full border text-sm font-ui font-bold ${bg} ${color}`}>
                {pct >= 75 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {label}
              </div>
            </div>

            {/* Circular progress arc */}
            <div className="flex justify-center mb-6">
              <svg width="160" height="80" viewBox="0 0 160 80">
                <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
                <motion.path
                  d="M 10 80 A 70 70 0 0 1 150 80"
                  fill="none"
                  stroke={booklet.colorFrom}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="220"
                  initial={{ strokeDashoffset: 220 }}
                  animate={{ strokeDashoffset: 220 - (220 * pct) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                />
              </svg>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-emerald-50 rounded-2xl py-3">
                <p className="font-display text-2xl text-emerald-600">{correct}</p>
                <p className="text-[10px] font-ui text-emerald-700 uppercase tracking-wider mt-0.5">Correct</p>
              </div>
              <div className="bg-red-50 rounded-2xl py-3">
                <p className="font-display text-2xl text-red-500">{total - correct}</p>
                <p className="text-[10px] font-ui text-red-600 uppercase tracking-wider mt-0.5">Wrong</p>
              </div>
              <div className="bg-slate-50 rounded-2xl py-3">
                <p className="font-display text-2xl text-slate-600">{timeTaken}</p>
                <p className="text-[10px] font-ui text-slate-500 uppercase tracking-wider mt-0.5">Time</p>
              </div>
            </div>
          </div>

          {/* Certificate Generation (only for Passing scores) */}
          {pct >= 70 && (
            <div className="bg-gradient-to-r from-burgundy to-burgundy-light rounded-3xl p-6 sm:p-8 mb-6 text-parchment shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Trophy size={120} />
              </div>
              
              <div className="relative z-10">
                <h3 className="font-display text-2xl mb-2">Claim Your Certificate</h3>
                <p className="font-body text-parchment/80 text-sm mb-6 max-w-sm">
                  Congratulations! You've passed the Excellence standard. Enter your name as you want it to appear on your official EduLaw certificate.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    placeholder="Enter your full name"
                    className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-parchment placeholder:text-parchment/40 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all font-ui"
                  />
                  <button
                    onClick={downloadCertificate}
                    disabled={isGenerating}
                    className="px-8 py-3.5 bg-gold text-burgundy rounded-xl font-ui font-black text-sm hover:bg-[#D4B96A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-burgundy border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <Award className="w-4 h-4" />
                    )}
                    Generate PDF
                  </button>
                </div>
                
                <p className="mt-4 text-[10px] font-ui uppercase tracking-widest text-gold font-black">
                  Ready to be featured on your LinkedIn Profile
                </p>
              </div>
            </div>
          )}

          {/* Hidden Certificate for Canvas Capture */}
          <div className="fixed -left-[2000px] top-0 pointer-events-none">
            <MCQCertificate
              userName={certName || "Student Name"}
              quizTitle={booklet.title}
              score={correct}
              totalQuestions={total}
              date={dateStr}
              certificateId={certId}
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => setReviewMode(true)}
              className="py-3.5 rounded-xl border-2 border-burgundy text-burgundy font-ui font-bold text-sm flex items-center justify-center gap-2 hover:bg-burgundy/5 transition-all"
            >
              <BookOpen className="w-4 h-4" /> Review Answers
            </button>
            <button
              onClick={onRetry}
              className="py-3.5 rounded-xl font-ui font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${booklet.colorFrom}, ${booklet.colorTo})`, color: '#F5F0E8' }}
            >
              <RotateCcw className="w-4 h-4" /> Retry Quiz
            </button>
          </div>
          <Link
            to="/mock-tests"
            className="w-full py-3 rounded-xl border border-ink/15 text-mutedgray font-ui text-sm flex items-center justify-center gap-2 hover:text-ink hover:border-ink/30 transition-all"
          >
            <Home className="w-4 h-4" /> All Booklets
          </Link>
        </>
      ) : (
        /* Review Mode */
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-ink">Answer Review</h2>
            <button
              onClick={() => setReviewMode(false)}
              className="flex items-center gap-1 text-sm font-ui text-burgundy hover:text-burgundy-light"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Results
            </button>
          </div>
          <div className="space-y-5">
            {booklet.questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct;
              return (
                <div key={q.id} className="bg-white rounded-2xl border border-ink/10 p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mt-0.5 ${
                      isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <p className="font-body text-sm text-ink leading-snug">{q.question}</p>
                  </div>
                  <div className="space-y-2 mb-3 pl-10">
                    {q.options.map(opt => (
                      <div key={opt.id} className={`flex items-center gap-2 text-xs font-ui rounded-lg px-3 py-2 ${
                        opt.id === q.correct
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : opt.id === userAnswer
                          ? 'bg-red-50 text-red-600'
                          : 'text-ink/40'
                      }`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border shrink-0 ${
                          opt.id === q.correct ? 'bg-emerald-500 text-white border-emerald-500'
                          : opt.id === userAnswer ? 'bg-red-400 text-white border-red-400'
                          : 'border-ink/15 text-ink/30'
                        }`}>
                          {opt.id}
                        </span>
                        {opt.text}
                        {opt.id === q.correct && <CheckCircle2 className="ml-auto w-4 h-4 text-emerald-500 shrink-0" />}
                        {opt.id === userAnswer && !isCorrect && <XCircle className="ml-auto w-4 h-4 text-red-400 shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <div className="pl-10">
                    <div className="flex items-start gap-2 bg-amber-50 rounded-xl border border-amber-100 p-3">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-body text-ink/70 leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setReviewMode(false)}
            className="mt-6 w-full py-3.5 rounded-xl border border-ink/15 text-mutedgray font-ui font-bold text-sm flex items-center justify-center gap-2 hover:text-ink transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </button>
        </>
      )}
    </motion.div>
  );
}

// ─── Booklet Locked Screen ───────────────────────────────────────────────────

function BookletLockedScreen({ booklet, currentUser }: { booklet: { title: string; subtitle?: string; subject?: string }; currentUser: User | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto px-4 py-12 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/20 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-9 h-9 text-gold" />
      </div>
      <h1 className="font-display text-3xl text-ink mb-2">{booklet.title}</h1>
      {booklet.subtitle && <p className="font-body text-mutedgray mb-4">{booklet.subtitle}</p>}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/10 text-gold rounded-full font-ui text-[10px] font-black uppercase tracking-widest mb-8">
        <Crown className="w-3 h-3" /> Pro &amp; Max Only
      </div>

      <div className="bg-burgundy/5 border border-burgundy/15 rounded-2xl p-6 mb-8 text-left">
        <p className="font-ui font-bold text-sm text-ink mb-3">What you get with Pro / Max:</p>
        <ul className="space-y-2 text-sm font-body text-ink/70">
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /> Access to all premium MCQ booklets</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /> Case Law Finder searches every month</li>
          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500 shrink-0" /> Daily legal news, digests &amp; insights — unlimited</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          to="/subscription"
          className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-gradient-to-r from-burgundy to-burgundy/80 text-parchment rounded-xl font-ui font-bold text-sm hover:shadow-lg hover:shadow-burgundy/25 transition-all"
        >
          <Crown className="w-4 h-4 text-gold" /> Subscribe — From ₹499/mo
        </Link>
        {!currentUser && (
          <Link
            to="/login"
            className="w-full min-h-[48px] flex items-center justify-center border border-ink/15 rounded-xl font-ui text-sm text-mutedgray hover:text-ink hover:border-ink/30 transition-all"
          >
            Already subscribed? Sign In
          </Link>
        )}
        <Link
          to="/mock-tests"
          className="w-full min-h-[44px] flex items-center justify-center rounded-xl font-ui text-sm text-mutedgray hover:text-ink transition-colors"
        >
          ← Back to All Booklets
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MCQQuiz() {
  const { bookletId } = useParams<{ bookletId: string }>();
  const { currentUser, isPro, isMax } = useAuth();

  // ─── Data Unification & Mapping ───────────────────────────────────────────
  // Map the mockTests from notes.ts (Mastery Path) to the MCQQuiz format
  const masteryBooklets: MCQBooklet[] = (notesMockTests || []).map(t => ({
    id: t.slug,
    title: t.title,
    subtitle: t.description,
    subject: t.category,
    totalQuestions: t.totalQuestions,
    duration: t.duration,
    difficulty: (t.difficulty === 'hard' ? 'Expert' : t.difficulty === 'medium' ? 'Intermediate' : 'Beginner') as any,
    colorFrom: '#6B1E2E',
    colorTo: '#8B2E42',
    icon: '⚖️',
    questions: (t.questions || []).map((q: any, idx: number) => ({
      id: idx + 1,
      question: q.question,
      options: (q.options || []).map((opt: string, oIdx: number) => ({
        id: (['A', 'B', 'C', 'D'][oIdx]) as any,
        text: opt
      })),
      correct: (['A', 'B', 'C', 'D'][q.correctAnswer]) as any,
      explanation: q.explanation || 'No explanation provided.'
    }))
  }));

  const allBooklets = [...mcqBooklets, ...premiumMcqBooklets, ...masteryBooklets];

  // ─── Firebase note-mcq loading ────────────────────────────────────────────
  const isNoteMCQ = bookletId?.startsWith('note-mcq-') ?? false;
  const [noteMCQBooklet, setNoteMCQBooklet] = useState<MCQBooklet | null>(null);
  const [noteMCQLoading, setNoteMCQLoading] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');

  useEffect(() => {
    if (!isNoteMCQ || !bookletId) return;
    const slug = bookletId.replace('note-mcq-', '');
    setNoteMCQLoading(true);
    getNoteMCQs(slug)
      .then(set => {
        if (!set) { setNoteMCQLoading(false); return; }
        setNoteMCQBooklet({
          id: bookletId,
          title: set.noteTitle,
          subtitle: '30 Questions · Easy, Medium & Hard',
          subject: set.noteTitle,
          totalQuestions: set.questions.length,
          duration: 45,
          difficulty: 'Intermediate',
          colorFrom: '#7c3aed',
          colorTo: '#4f46e5',
          icon: '📚',
          questions: set.questions as MCQQuestion[],
          isPremium: false,
        });
        setNoteMCQLoading(false);
      })
      .catch(() => setNoteMCQLoading(false));
  }, [isNoteMCQ, bookletId]);

  // Raw booklet (unfiltered)
  const rawBooklet = isNoteMCQ
    ? noteMCQBooklet
    : (allBooklets.find(b => b.id === bookletId || b.id === bookletId?.split('/').pop()) ?? null);

  // Difficulty-filtered questions (only for note-mcq booklets)
  const filteredQuestions = useMemo(() => {
    if (!rawBooklet) return [];
    if (!isNoteMCQ || difficultyFilter === 'all') return rawBooklet.questions;
    return rawBooklet.questions.filter((q: any) => q.difficulty === difficultyFilter);
  }, [rawBooklet, isNoteMCQ, difficultyFilter]);

  // Final booklet passed to all sub-components
  const booklet = rawBooklet
    ? { ...rawBooklet, questions: filteredQuestions, totalQuestions: filteredQuestions.length }
    : null;

  const [phase, setPhase] = useState<QuizPhase>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [totalSeconds, setTotalSeconds] = useState(0);
  const { fmt: timerFmt, seconds, reset: resetTimer } = useTimer(phase === 'quiz');

  // Save elapsed time when finishing
  const handleFinish = useCallback(() => {
    setTotalSeconds(seconds);
    setPhase('result');
  }, [seconds]);

  const handleStart = () => {
    setPhase('quiz');
    setCurrentIdx(0);
    setAnswers({});
    resetTimer();
  };

  const handleRetry = () => {
    setPhase('start');
    setCurrentIdx(0);
    setAnswers({});
    setTotalSeconds(0);
    resetTimer();
  };

  const handleSelect = (id: 'A' | 'B' | 'C' | 'D') => {
    if (answers[currentQuestion?.id ?? 0]) return; // already answered
    setAnswers(a => ({ ...a, [(currentQuestion?.id ?? 0)]: id }));
  };

  const handleNext = () => {
    if (currentIdx + 1 >= (booklet?.questions.length ?? 0)) {
      handleFinish();
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  if (noteMCQLoading) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <p className="font-ui text-mutedgray text-sm">Loading questions…</p>
      </div>
    );
  }

  if (!booklet) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center gap-4 px-4">
        <p className="font-display text-2xl text-ink">Booklet not found</p>
        <Link to="/mock-tests" className="font-ui text-burgundy underline">Back to Mock Tests</Link>
      </div>
    );
  }

  const currentQuestion: MCQQuestion | undefined = booklet.questions[currentIdx];

  return (
    <div className="min-h-screen bg-parchment">
      <SEO
        title={`${booklet.title} — Interactive MCQ Quiz`}
        description={`Take the interactive ${booklet.title} quiz with ${booklet.totalQuestions} MCQs, instant explanations, and score tracking.`}
        canonical={`/mock-tests/${booklet.id}`}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-parchment/95 backdrop-blur border-b border-ink/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/mock-tests"
            className="flex items-center gap-1.5 text-sm font-ui text-mutedgray hover:text-ink transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            All Booklets
          </Link>
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1 rounded-full text-[10px] font-ui font-black uppercase tracking-wider text-white"
              style={{ background: `linear-gradient(90deg, ${booklet.colorFrom}, ${booklet.colorTo})` }}
            >
              {booklet.subject}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pb-16 pt-4">
        <AnimatePresence mode="wait">
          {phase === 'start' && (
            <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {(booklet?.isPremium === true) && !(isPro || isMax) ? (
                <BookletLockedScreen booklet={booklet} currentUser={currentUser} />
              ) : (
                <StartScreen
                  booklet={booklet}
                  onStart={handleStart}
                  isNoteMCQ={isNoteMCQ}
                  difficultyFilter={difficultyFilter}
                  onDifficultyChange={d => { setDifficultyFilter(d); setCurrentIdx(0); setAnswers({}); }}
                />
              )}
            </motion.div>
          )}

          {phase === 'quiz' && currentQuestion && (
            <motion.div key={`q-${currentIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuestionCard
                question={currentQuestion}
                index={currentIdx + 1}
                total={booklet.questions.length}
                selected={answers[currentQuestion.id]}
                onSelect={handleSelect}
                onNext={handleNext}
                isLast={currentIdx + 1 >= booklet.questions.length}
                timerFmt={timerFmt}
                booklet={booklet}
              />
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultScreen
                booklet={booklet}
                answers={answers}
                totalSeconds={totalSeconds}
                onRetry={handleRetry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
