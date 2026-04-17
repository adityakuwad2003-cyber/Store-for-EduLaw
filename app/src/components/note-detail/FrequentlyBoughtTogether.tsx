import { useState } from 'react';
import { Check, Zap, Volume2, FileText, Info, Bell } from 'lucide-react';
import { toast } from 'sonner';



export function FrequentlyBoughtTogether({
  baseNote,
  mcqSelected,
  audioSelected,
  onUpdateCart,
  isInCart
}: any) {
  const [email, setEmail] = useState('');
  const [showNotifyForm, setShowNotifyForm] = useState<string | null>(null); // 'mcq' | 'audio' | null

  const handleNotifySubmit = (e: React.FormEvent, addonId: string) => {
    e.preventDefault();
    if (!email) return;
    toast.success(`You'll be notified when ${addonId === 'mcq' ? 'Mock Tests' : 'Audio Summaries'} fall drop!`);
    setEmail('');
    setShowNotifyForm(null);
  };

  const AddonCard = ({ addonId, title, icon: Icon, iconColor, price, originalPrice, available }: any) => (
    <div className={`w-full p-4 sm:p-5 rounded-2xl border transition-all flex items-center gap-4 group text-left min-w-0 ${
      available ? 'bg-white border-slate-200 cursor-pointer hover:border-gold/50' : 'bg-slate-50 border-slate-100'
    }`}>
      {!available && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-gold/10 text-gold text-[8px] font-black uppercase tracking-widest rounded-md border border-gold/20">
          COMING SOON
        </div>
      )}
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${available ? 'bg-white' : 'bg-parchment'}`}>
        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-ui font-black text-slate-400 uppercase tracking-widest mb-0.5">Add-on Mastery</p>
        <h4 className="font-display text-sm font-bold text-ink truncate mb-0.5">{title}</h4>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-gold text-xs">₹{price}</span>
          <span className="text-[9px] text-slate-300 line-through">₹{originalPrice}</span>
        </div>
      </div>
      <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
        {!available ? (
           <button 
             onClick={() => setShowNotifyForm(showNotifyForm === addonId ? null : addonId)}
             className="w-full h-full rounded-full bg-slate-100 hover:bg-gold/10 text-slate-400 hover:text-gold transition-colors flex items-center justify-center"
             title="Notify Me"
           >
             <Bell className="w-4 h-4" />
           </button>
        ) : (
           <div className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-all ${false ? 'bg-gold border-gold text-white' : 'border-slate-200 flex items-center justify-center'}`} />
        )}
      </div>

       {/* Inline Notify Form for Mobile/Desktop */}
       {!available && showNotifyForm === addonId && (
          <div className="absolute inset-x-0 -bottom-14 h-12 bg-white border border-gold/20 rounded-xl shadow-lg p-1 z-10 flex">
             <input 
               type="email" 
               placeholder="Enter your email..." 
               value={email}
               onChange={e => setEmail(e.target.value)}
               className="flex-1 bg-transparent px-3 text-xs font-ui text-ink outline-none"
               autoFocus
             />
             <button 
               onClick={(e) => handleNotifySubmit(e, addonId)}
               className="h-full px-4 bg-gold text-ink rounded-lg text-[10px] font-ui font-black uppercase tracking-widest"
             >
                Notify
             </button>
          </div>
       )}
    </div>
  );

  return (
    <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 border border-slate-200 shadow-xl relative overflow-visible group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-slate-900 font-bold mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
              Frequently <span className="text-gold">Bought</span> Together
            </h2>
            <p className="text-slate-500 font-ui text-xs sm:text-sm">Perfect companions for your exam preparation</p>
          </div>
          <div className="bg-slate-50 px-4 py-3 sm:px-5 sm:py-3 rounded-2xl border border-slate-100 flex items-center justify-between sm:justify-start gap-4 sm:gap-4 shrink-0 w-full md:w-auto">
            <div>
              <p className="text-[9px] sm:text-[10px] font-ui font-black uppercase tracking-widest text-slate-400 mb-0.5">Note + Selected Add-ons</p>
              <p className="text-xl sm:text-2xl font-display font-black text-ink leading-tight">
                ₹{baseNote.price + (mcqSelected ? 49 : 0) + (audioSelected ? 49 : 0)}
              </p>
            </div>
            <button 
              onClick={onUpdateCart}
              className="h-10 sm:h-12 px-4 sm:px-6 bg-burgundy text-white rounded-xl font-ui font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-burgundy-light transition-all shadow-lg shadow-burgundy/20 shrink-0 whitespace-nowrap"
            >
              {isInCart ? 'Update Cart' : 'Add Items'}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4 xl:gap-6 relative">
          {/* Vertical/Horizontal Connecting Lines */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-0.5 bg-slate-100/50 -z-10" />
          <div className="lg:hidden absolute left-8 sm:left-10 top-12 bottom-12 w-0.5 bg-slate-100/50 -z-10" />

          {/* 1. Main Note */}
          <div className="w-full lg:w-1/3 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 relative opacity-60 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-burgundy/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-ui font-black text-gold uppercase tracking-widest mb-0.5">Current Subject</p>
              <h4 className="font-display text-sm font-bold text-ink truncate mb-0.5">{baseNote.title}</h4>
              <span className="font-display font-medium text-xs text-gold">₹{baseNote.price}</span>
            </div>
            <div className="w-5 h-5 bg-burgundy text-white rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 mx-1 sm:mx-2">
              <Check className="w-3 h-3" />
            </div>
          </div>

          <div className="hidden lg:flex justify-center w-8 shrink-0 relative bg-white z-10"><Zap className="w-4 h-4 text-slate-200 rotate-90" /></div>

          {/* 2. MCQ Add-on */}
          <div className="w-full lg:w-1/3 relative">
              <AddonCard 
                addonId="mcq"
                title="Subject Mock Test"
                icon={Zap}
                iconColor="text-amber-500/40"
                price={49}
                originalPrice={199}
                available={false}
              />
          </div>

          <div className="hidden lg:flex justify-center w-8 shrink-0 relative bg-white z-10"><Zap className="w-4 h-4 text-slate-200 rotate-90" /></div>

          {/* 3. Audio Add-on */}
          <div className="w-full lg:w-1/3 relative">
            <AddonCard 
                addonId="audio"
                title="AI Audio Summary"
                icon={Volume2}
                iconColor="text-indigo-400/40"
                price={49}
                originalPrice={149}
                available={false}
              />
          </div>
        </div>

        <div className="mt-8 sm:mt-10 p-5 sm:p-6 bg-gold/5 rounded-3xl border border-gold/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            </div>
            <p className="text-[11px] sm:text-xs font-ui text-ink/70 leading-relaxed max-w-lg">
              Selecting these add-ons will grant you lifetime access to the <strong>interactive practice portal</strong> and <strong>high-fidelity bilingual audio summary</strong> for this subject.
            </p>
          </div>
          <div className="flex items-center gap-2 text-gold font-display font-black text-base sm:text-lg shrink-0 self-end sm:self-auto">
             SAVE ₹250 Today!
          </div>
        </div>
      </div>
    </div>
  );
}
