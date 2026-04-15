import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Zap, Loader2, Sparkles, 
  Award, HelpCircle, BookOpen, 
  BrainCircuit, CheckCircle2, Share2,
  Layout, ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface EvaluationResult {
  score: number;
  feedback: {
    accuracy: string;
    citations: string;
    structure: string;
    markingScheme: string;
  };
  modelAnswer: string;
}

export function MainsEvaluator() {
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const evaluateAnswer = async () => {
    if (answer.trim().length < 50) {
      toast.error('The answer is too short. Please provide at least 50 words for a meaningful evaluation.');
      return;
    }

    setIsEvaluating(true);
    setResult(null);

    const systemPrompt = `
      You are an expert Indian Judiciary and UPSC Law Optional Examiner.
      Task: Evaluate a student's legal mains answer.
      Rubric:
      1. Legal Accuracy (Concepts & Principles)
      2. Case Citations (Relevant landmark & recent judgments)
      3. Structure (Introduction, Body/Analysis, Conclusion)
      4. Marking Scheme Alignment (Scores out of 10)
      
      Format the response as a valid JSON object:
      {
        "score": 0,
        "feedback": {
          "accuracy": "",
          "citations": "",
          "structure": "",
          "markingScheme": ""
        },
        "modelAnswer": "Brief 1-2 paragraph model answer"
      }
    `;

    try {
      const response = await fetch('/api/ai/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Evaluate this answer:\n\n${answer}`,
          systemPrompt,
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const parsedData = JSON.parse(data.result);
      setResult(parsedData);
      toast.success('Evaluation Completed! Review your feedback below.');
    } catch (error) {
      console.error('Evaluation Error:', error);
      toast.error('Failed to evaluate. Please try again or check your server configuration.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const wordCount = answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-ink/95 to-ink rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden group border border-gold/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-burgundy/10 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-[10px] font-ui font-black uppercase tracking-widest text-gold italic">Pro Feature</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-bold mb-4 tracking-tight">
            Judiciary Mains <span className="text-gold italic underline decoration-gold/30 underline-offset-8">Answer Evaluator</span>
          </h2>
          <p className="text-slate-400 font-ui text-sm max-w-2xl leading-relaxed">
            Write your answer below. Our AI simulates a real Judiciary examiner to score your performance
            on legal accuracy, case law citations, and structure.
          </p>
        </div>
        
        <div className="absolute top-10 right-10 hidden lg:block opacity-20 group-hover:opacity-40 transition-opacity">
          <Award className="w-32 h-32 text-gold animate-float" />
        </div>
      </div>

      {/* Input Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative group">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Paste or write your answer here (e.g., Explain the doctrine of basic structure with landmark cases...)"
              className="w-full h-[500px] bg-white border-2 border-parchment-dark/30 rounded-3xl p-8 font-serif text-lg text-ink focus:outline-none focus:border-gold/50 shadow-inner resize-none transition-all placeholder:text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-gold/20"
              disabled={isEvaluating}
            />
            <div className="absolute bottom-6 right-8 flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-ui font-black text-slate-500 uppercase tracking-widest">{wordCount} Words</span>
               </div>
               <button
                  onClick={evaluateAnswer}
                  disabled={isEvaluating || wordCount < 20}
                  className="flex items-center gap-3 px-8 py-3 bg-gold text-ink rounded-2xl font-ui font-black uppercase tracking-widest text-xs hover:bg-gold/90 transition-all shadow-xl shadow-gold/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {isEvaluating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                  ) : (
                    <><Zap className="w-4 h-4" /> Get AI Review</>
                  )}
                </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-parchment-dark/30 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center group-hover:bg-gold transition-colors">
                    <BrainCircuit className="w-5 h-5 text-gold group-hover:text-ink" />
                </div>
                <h4 className="font-display font-black text-[12px] uppercase tracking-widest text-ink">Free Evaluation</h4>
            </div>
            <p className="text-xs text-slate-500 font-ui leading-relaxed mb-4">
               You can use the Groq Llama-3.1-70B model to evaluate up to <span className="text-ink font-bold">14,400</span> answers per day. Zero cost, blazing fast.
            </p>
            <div className="space-y-2">
                {['Legal Accuracy', 'Case Citations', 'Structure & Flow', 'Marking Scheme'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-ui font-bold text-ink/70">{item}</span>
                    </div>
                ))}
            </div>
          </div>

          <div className="bg-burgundy/5 border border-burgundy/10 rounded-3xl p-6 flex items-start gap-4">
            <HelpCircle className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
            <div className="space-y-1">
                <p className="text-[10px] font-ui font-black text-burgundy uppercase tracking-widest">Tips for High Score</p>
                <p className="text-xs text-burgundy/70 font-ui leading-relaxed">
                   Use bullet points, cite the latest 2024 judgments from LiveLaw, and always include a brief conclusion.
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Scorecard */}
            <div className="grid sm:grid-cols-4 gap-4">
                <div className="bg-white border border-parchment-dark/50 rounded-3xl p-6 text-center group transition-all hover:bg-gold/5 hover:border-gold/30">
                    <p className="text-[10px] font-ui font-black text-slate-400 uppercase tracking-widest mb-2">Total Score</p>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-display font-black text-ink">{result.score}</span>
                        <span className="text-lg text-slate-400 font-ui">/10</span>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.score * 10}%` }}
                                className={`h-full ${result.score > 7 ? 'bg-green-500' : result.score > 4 ? 'bg-gold' : 'bg-burgundy'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Feedback Cards */}
                <div className="sm:col-span-3 grid sm:grid-cols-2 gap-4">
                    {[
                        { title: 'Legal Accuracy', content: result.feedback.accuracy, icon: BookOpen, color: 'text-blue-500' },
                        { title: 'Case Citations', content: result.feedback.citations, icon: Layout, color: 'text-indigo-500' },
                    ].map((card) => (
                        <div key={card.title} className="bg-white border border-parchment-dark/30 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <card.icon className={`w-4 h-4 ${card.color}`} />
                                <span className="text-[10px] font-ui font-black text-ink/70 uppercase tracking-widest">{card.title}</span>
                            </div>
                            <p className="text-[11px] font-ui text-slate-600 leading-relaxed tabular-nums">{card.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                        { title: 'Structure Feedback', content: result.feedback.structure, icon: Layout, color: 'text-amber-500' },
                        { title: 'Marking Logic', content: result.feedback.markingScheme, icon: ClipboardCheck, color: 'text-emerald-500' },
                        { title: 'Model Answer', content: result.modelAnswer, icon: Sparkles, color: 'text-gold' },
                 ].map((card, idx) => (
                    <div key={idx} className={`bg-white border border-parchment-dark/30 rounded-3xl p-8 shadow-sm ${idx === 2 ? 'lg:col-span-1 border-gold/30 bg-gold/5' : ''}`}>
                         <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <h4 className="text-[11px] font-ui font-black text-ink uppercase tracking-widest">{card.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-ui leading-relaxed italic">{card.content}</p>
                    </div>
                 ))}
            </div>

            {/* Action Footer */}
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-10 bg-white border border-parchment-dark/30 rounded-[40px] shadow-sm">
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-gold" />
                     </div>
                     <div>
                        <p className="text-xs font-display font-bold text-ink">Share Evaluation</p>
                        <p className="text-[10px] font-ui text-slate-400">Save this to your personal dashboard or share with mentors.</p>
                     </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white border border-parchment-dark text-ink rounded-xl font-ui font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Save to Repository
                    </button>
                    <button className="px-6 py-3 bg-ink text-white rounded-xl font-ui font-bold text-[10px] uppercase tracking-widest hover:bg-ink/90 transition-all">
                        Try Another Subject
                    </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


