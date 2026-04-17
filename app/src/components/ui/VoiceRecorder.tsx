import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, Trash2, Clock, CheckCircle2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * EduLaw Voice Answer Practice (Web Speech API)
 * Zero-cost transcription for oral answer practice.
 * Students can speak their answers, review the transcript, and save it.
 */

export function VoiceRecorder({ onTranscript }: { onTranscript?: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Indian English

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech Error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in browser settings.');
        }
        stopRecording();
      };
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech Recognition not supported in this browser.');
      return;
    }

    setTranscript('');
    setTimer(0);
    setIsRecording(true);
    recognitionRef.current.start();

    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border-2 border-parchment-dark/30 rounded-[2rem] p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gold/10 text-gold'}`}>
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-display font-bold text-ink uppercase tracking-widest">Oral Practice Mode</h3>
            <p className="text-[10px] font-ui text-slate-400">Speak your answer clearly. Transcribed in real-time.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-ui font-bold text-ink tabular-nums">{formatTime(timer)}</span>
           </div>
           {!isRecording ? (
             <button
               onClick={startRecording}
               className="flex items-center gap-2 px-6 py-2.5 bg-ink text-white rounded-xl font-ui font-bold text-xs uppercase tracking-widest hover:bg-ink/90 transition-all shadow-lg shadow-ink/10"
             >
               Start Speaking
             </button>
           ) : (
             <button
               onClick={stopRecording}
               className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl font-ui font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all animate-pulse"
             >
               <Square className="w-3 h-3 fill-white" /> Stop
             </button>
           )}
        </div>
      </div>

      <div className="relative group">
        <div className="w-full min-h-[200px] bg-slate-50/50 border border-slate-100 rounded-3xl p-8 font-serif text-lg text-ink leading-relaxed whitespace-pre-wrap">
          {transcript || <span className="text-slate-300 italic">Your spoken answer will appear here...</span>}
        </div>
        
        {transcript && !isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
               onClick={() => {
                 onTranscript?.(transcript);
                 toast.success('Transcript copied to Evaluator!');
               }}
               className="flex items-center gap-2 px-4 py-2 bg-gold text-ink rounded-xl font-ui font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-gold/20"
            >
              <Save className="w-3 h-3" /> Use for Evaluation
            </button>
            <button
               onClick={() => setTranscript('')}
               title="Delete transcript"
               className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
             <CheckCircle2 className="w-3 h-3" />
             <span className="text-[10px] font-ui font-bold uppercase">Web Speech API</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
             <Volume2 className="w-3 h-3" />
             <span className="text-[10px] font-ui font-bold uppercase">Zero API Cost</span>
          </div>
      </div>
    </div>
  );
}
