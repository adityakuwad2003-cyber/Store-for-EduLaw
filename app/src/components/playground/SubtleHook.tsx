import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { getRecommendedHook } from '../../lib/hookEngine';

interface SubtleHookProps {
  textToMatch: string;
  className?: string;
}

export const SubtleHook: React.FC<SubtleHookProps> = ({ textToMatch, className = "" }) => {
  const navigate = useNavigate();
  const hook = getRecommendedHook(textToMatch);

  if (!hook) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-lg ${hook.bgClass} ${className}`}
    >
      {/* Background Sparkle Effect */}
      <div className="absolute -right-6 -top-6 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity rotate-12">
        <Sparkles className="w-24 h-24" />
      </div>

      <div className="flex items-start gap-3 relative z-10">
        <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-xl shrink-0 shadow-sm border border-white/20">
          {hook.icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
             <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 leading-none">{hook.topic}</span>
             <span className="w-1 h-1 rounded-full bg-current opacity-20" />
             <span className="text-[10px] font-bold text-current/60 uppercase tracking-widest leading-none">Recommended</span>
          </div>
          <h4 className="font-display text-base text-current leading-tight mb-1">{hook.cta}</h4>
          <p className="font-body text-[11px] opacity-70 leading-relaxed max-w-md">
            {hook.description}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate(hook.link)}
        className="relative z-10 shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-ink text-parchment rounded-[14px] font-ui text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-md shadow-ink/10"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        {hook.label}
        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};
