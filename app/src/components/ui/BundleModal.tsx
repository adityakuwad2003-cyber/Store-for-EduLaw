import { Sparkles, ArrowRight, Zap, Tag, Layers, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface BundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteCount: number;
  noteId?: string | null;
}

export function BundleModal({ isOpen, onClose, noteCount, noteId }: BundleModalProps) {
  const isTier1 = noteCount >= 2;
  const isTier2 = noteCount >= 10;
  
  const nextTier = noteCount < 2 ? 2 : 10;
  const remaining = nextTier - noteCount;
  const nextDiscount = noteCount < 2 ? '15%' : '20%';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-parchment border-gold/20 rounded-[2rem]">
        {/* Animated Banner */}
        <div className="bg-gradient-to-br from-burgundy to-burgundy-light p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="font-ui text-[10px] font-black uppercase tracking-widest text-gold text-white">Instant Savings</span>
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">Build Your Bundle</h2>
            <p className="text-white/70 text-sm font-ui">The more you study, the more you save.</p>
          </div>
        </div>

        <div className="p-8">
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-ui font-black uppercase tracking-widest text-ink/40">Discount Progress</h3>
              <span className="text-xs font-ui font-bold text-gold">{noteCount} / {nextTier} Notes</span>
            </div>
            
            <div className="relative h-4 bg-ink/5 rounded-full overflow-hidden mb-6 flex">
              {/* Tier 1 Segment */}
              <div className="absolute left-[20%] top-0 bottom-0 w-1 bg-parchment z-10" title="15% Off Tier" />
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 ease-out flex items-center justify-end pr-2 overflow-hidden" 
                style={{ width: `${Math.min((noteCount / 10) * 100, 100)}%` as any }}
              >
                {noteCount >= 2 && <Check className="w-2 h-2 text-white" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-[1.5rem] border-2 transition-all ${isTier1 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-ink/5 opacity-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Tag className={`w-4 h-4 ${isTier1 ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-ui font-black uppercase tracking-widest ${isTier1 ? 'text-emerald-700' : 'text-slate-400'}`}>Tier 1</span>
                </div>
                <p className={`font-display text-xl font-bold ${isTier1 ? 'text-emerald-800' : 'text-slate-800'}`}>15% OFF</p>
                <p className="text-[10px] font-ui text-slate-500 mt-1">2+ Notes selection</p>
              </div>

              <div className={`p-4 rounded-[1.5rem] border-2 transition-all ${isTier2 ? 'bg-gold/10 border-gold/30' : 'bg-white border-ink/5 opacity-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`w-4 h-4 ${isTier2 ? 'text-gold' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-ui font-black uppercase tracking-widest ${isTier2 ? 'text-gold' : 'text-slate-400'}`}>Tier 2</span>
                </div>
                <p className={`font-display text-xl font-bold ${isTier2 ? 'text-[#8B6914]' : 'text-slate-800'}`}>20% OFF</p>
                <p className="text-[10px] font-ui text-slate-500 mt-1">10+ Notes selection</p>
              </div>
            </div>
          </div>

          {/* Motivation Message */}
          <div className="bg-ink/5 rounded-2xl p-6 mb-8 text-center">
            {noteCount < 10 ? (
              <p className="font-ui text-sm text-ink/70 leading-relaxed">
                Add <span className="font-bold text-burgundy">{remaining} more {remaining === 1 ? 'note' : 'notes'}</span> to your cart and unlock the <span className="font-bold text-emerald-600">{nextDiscount} bundle discount</span> immediately.
              </p>
            ) : (
              <p className="font-ui text-sm text-emerald-600 font-bold leading-relaxed">
                🎉 Congratulations! You have unlocked the maximum 20% discount on your entire bundle.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to={noteId ? `/bundles?preselect=${noteId}` : '/bundles'}
              onClick={onClose}
              className="w-full py-4 bg-burgundy text-parchment rounded-2xl font-ui font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 hover:bg-burgundy-light transition-all shadow-xl shadow-burgundy/20 active:scale-95"
            >
              <Layers className="w-4 h-4" /> Build My Bundle <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white border border-ink/10 text-ink rounded-2xl font-ui font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 hover:bg-ink hover:text-white transition-all active:scale-95"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
