import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * EduLaw Focus Timer (Pomodoro for Legal Studies)
 * Helps students track focus time per subject.
 * Uses localStorage for basic persistence of sessions.
 */

interface Session {
  subject: string;
  duration: number; // minutes
  date: string;
}

export function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState('Constitutional Law');
  const [sessions, setSessions] = useState<Session[]>(() => {
    const s = localStorage.getItem('edulaw_focus_sessions');
    return s ? JSON.parse(s) : [];
  });
  
  const subjects = ['Constitutional Law', 'Criminal Law', 'Civil Law', 'Evidence Law', 'Legal Drafting', 'General Studies'];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    const newSession: Session = {
      subject,
      duration: 25,
      date: new Date().toLocaleDateString()
    };
    const updated = [newSession, ...sessions].slice(0, 50);
    setSessions(updated);
    localStorage.setItem('edulaw_focus_sessions', JSON.stringify(updated));
    toast.success(`Session Complete! Great work on ${subject}.`);
    
    // Play a gentle notification sound if possible
    try { new Audio('/notification-ping.mp3').play(); } catch (e) {}
    
    setTimeLeft(25 * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bg-white border-2 border-parchment-dark/30 rounded-[2.5rem] p-8 lg:p-12 shadow-sm text-center">
      <div className="flex items-center justify-center gap-3 mb-8">
         <div className="w-10 h-10 bg-burgundy/10 rounded-xl flex items-center justify-center">
            <Timer className="w-5 h-5 text-burgundy" />
         </div>
         <h3 className="font-display font-black text-xs uppercase tracking-widest text-ink/70">Legal Study Focus</h3>
      </div>

      {/* Timer Display */}
      <div className="relative inline-block mb-12">
          <svg className="w-64 h-64 -rotate-90">
             <circle 
                cx="128" cy="128" r="120" 
                className="stroke-slate-100 fill-none" 
                strokeWidth="8" 
             />
             <circle 
                cx="128" cy="128" r="120" 
                className="stroke-gold fill-none transition-all duration-1000" 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray="753.6"
                strokeDashoffset={753.6 * (1 - timeLeft / (25 * 60))}
             />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-6xl font-display font-black text-ink tabular-nums">
               {mins}:{secs.toString().padStart(2, '0')}
             </span>
             <span className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400 mt-2">Deep Focus Mode</span>
          </div>
      </div>

      {/* Subject Picker */}
      <div className="max-w-xs mx-auto mb-10">
          <p className="text-[9px] font-ui font-black uppercase tracking-widest text-slate-400 mb-3 text-left pl-4">Studying Now</p>
          <select 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isActive}
            title="Select Study Subject"
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-ui font-bold text-sm text-ink appearance-none focus:outline-none focus:border-gold transition-all"
          >
             {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
          <button 
             onClick={resetTimer}
             title="Reset Timer"
             className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-burgundy transition-all"
          >
             <RotateCcw className="w-5 h-5" />
          </button>
          <button 
             onClick={toggleTimer}
             className={`px-12 py-4 rounded-2xl font-ui font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 ${isActive ? 'bg-burgundy text-white shadow-burgundy/20' : 'bg-gold text-ink shadow-gold/20'}`}
          >
             {isActive ? <><Pause className="w-5 h-5 inline mr-3 fill-white" /> Pause</> : <><Play className="w-5 h-5 inline mr-3 fill-ink" /> Start Session</>}
          </button>
      </div>

      {/* History */}
      {sessions.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-50">
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-ui font-black uppercase tracking-widest text-slate-400">Recent Sessions</h4>
                <div className="flex items-center gap-2 text-gold">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-ui font-bold">{sessions.length} Pomos Completed</span>
                </div>
             </div>
             <div className="grid sm:grid-cols-2 gap-3">
                {sessions.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="text-left">
                            <p className="text-[11px] font-ui font-bold text-ink">{s.subject}</p>
                            <p className="text-[9px] font-ui text-slate-400">{s.date}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                ))}
             </div>
          </div>
      )}
    </div>
  );
}
