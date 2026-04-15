import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Check } from 'lucide-react';

interface AIStudyPlanGeneratorProps {
  tableOfContents?: string[];
}

export function AIStudyPlanGenerator({ tableOfContents }: AIStudyPlanGeneratorProps) {
  const [showStudyPlan, setShowStudyPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<{ day: number; topics: string[]; tips: string }[]>([]);

  const generateStudyPlan = () => {
    if (!tableOfContents) return;
    const chapters = tableOfContents;
    const plan = [];
    const chaptersPerDay = Math.ceil(chapters.length / 5); // 5 days of study, 2 days of revision
    
    for (let i = 0; i < 5; i++) {
        const start = i * chaptersPerDay;
        const dayTopics = chapters.slice(start, start + chaptersPerDay);
        if (dayTopics.length > 0) {
            plan.push({
                day: i + 1,
                topics: dayTopics,
                tips: i === 0 ? "Initial read-through and high-level mapping." : "Focus on landmark cases for these chapters."
            });
        }
    }
    // Add Revision Days
    plan.push({ day: 6, topics: ["Full Subject Revision"], tips: "Use Active Recall: Try to explain concepts without looking at the notes." });
    plan.push({ day: 7, topics: ["Practice Assessment"], tips: "Attempt subject mock tests under exam conditions." });
    
    setGeneratedPlan(plan);
    setShowStudyPlan(true);
  };

  return (
    <div className="bg-gradient-to-br from-ink to-ink/90 rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 border border-gold/20 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-burgundy/20 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 sm:gap-10">
            <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="text-[10px] font-ui font-black uppercase tracking-widest text-gold">Free AI Feature</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white font-bold mb-4 text-balance">
                    Generate Your <span className="text-gold italic">AI-Powered</span> 7-Day Study Plan
                </h2>
                <p className="text-slate-400 font-ui text-xs sm:text-sm mb-8 max-w-xl leading-relaxed text-balance">
                    Stop worrying about how to finish this subject. Our algorithm analyzes the curriculum structure and builds a scientifically-optimized schedule for you.
                </p>
                <button 
                    onClick={generateStudyPlan}
                    className="w-full md:w-auto px-8 py-4 bg-gold text-ink rounded-2xl font-ui font-black uppercase tracking-widest text-xs hover:bg-gold/90 transition-all shadow-xl shadow-gold/20 active:scale-95 flex items-center justify-center gap-3 mx-auto md:mx-0"
                >
                    <Calendar className="w-4 h-4" /> Build My Schedule
                </button>
            </div>
            
            <div className="w-full md:w-1/3 flex justify-center hidden sm:flex">
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-3xl flex items-center justify-center relative animate-float">
                    <div className="absolute inset-4 border border-gold/20 rounded-[32px] flex items-center justify-center">
                        <Sparkles className="w-20 h-20 text-gold/30" />
                    </div>
                    <div className="absolute -top-4 -right-4 p-4 bg-white rounded-2xl shadow-xl">
                        <Check className="w-6 h-6 text-green-500" />
                    </div>
                </div>
            </div>
        </div>

        {/* The Generated Plan Content */}
        <AnimatePresence>
            {showStudyPlan && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-white/10"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {generatedPlan.map((day) => (
                            <div key={day.day} className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-ui font-black uppercase tracking-widest text-gold">Day {day.day}</span>
                                    <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500 text-[10px] font-bold">
                                        {day.day <= 5 ? 'Study' : 'Review'}
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {day.topics.map((t, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-gold shrink-0" />
                                            <span className="text-xs text-white/80 font-medium truncate">{t}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-3 border-t border-white/5">
                                    <p className="text-[9px] text-slate-500 italic leading-relaxed">
                                        {day.tips}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => setShowStudyPlan(false)}
                            className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                            Hide Plan
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
