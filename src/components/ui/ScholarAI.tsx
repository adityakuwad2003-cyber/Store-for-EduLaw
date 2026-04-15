import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Sparkles, 
  Lightbulb, Search, BookOpen,
  GraduationCap
} from 'lucide-react';
import { glossaryData } from '@/data/glossaryData';
import { useUIStore } from '@/store';

interface ScholarAIProps {
  currentCategory?: string;
}

export function ScholarAI({ currentCategory }: ScholarAIProps) {
  const { isScholarAIOpen: isOpen, setScholarAI: setIsOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'bot'; content: string; type?: 'glossary' | 'fact' | 'tip' }[]>([
    { 
      role: 'bot', 
      content: "Hello! I'm your **EduLaw Scholar AI**. I can explain legal terms, provide subject facts, or help with study strategies. How can I assist your learning today?" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userMsg = query.trim();
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      processQuery(userMsg);
    }, 800);
  };

  const processQuery = (text: string) => {
    const lowerText = text.toLowerCase();
    let response = "";
    let type: 'glossary' | 'fact' | 'tip' | undefined;

    // 1. Glossary Search - match full term or word from term
    const term = glossaryData.find(g => 
      lowerText.includes(g.term.toLowerCase()) || 
      g.term.toLowerCase().includes(lowerText)
    );

    if (term && (lowerText.length > 2 || lowerText.includes(term.term.toLowerCase()))) {
      response = `**${term.term}** (${term.origin}): ${term.definition}\n\n*Usage:* ${term.usageExample}`;
      type = 'glossary';
    } 
    // 2. Subject Specific logic
    else if (lowerText.includes('fact') || lowerText.includes('tell me about')) {
      response = getFastFact(currentCategory || 'General Law');
      type = 'fact';
    }
    // 3. Strategy logic
    else if (lowerText.includes('study') || lowerText.includes('prepare') || lowerText.includes('how to')) {
      response = getStudyTip(currentCategory || 'Law');
      type = 'tip';
    }
    // 4. Fallback
    else {
      response = "I couldn't find a specific match for that. Try asking about a legal term (like 'Mens Rea'), or ask for a 'Fast Fact' about this subject!";
    }

    setChat(prev => [...prev, { role: 'bot', content: response, type }]);
    setIsTyping(false);
  };

  const getFastFact = (category: string) => {
    const facts: Record<string, string[]> = {
      'Criminal Law': [
        "The Bharatiya Nyaya Sanhita (BNS) 2023 has replaced the 163-year-old Indian Penal Code (IPC).",
        "Under the new laws, 'Community Service' has been introduced as a form of punishment for petty offences.",
        "Cruelty against women (Sec 498A IPC) is now covered under Section 85/86 of BNS."
      ],
      'Constitutional Law': [
        "The Indian Constitution is the longest written constitution of any sovereign country in the world.",
        "The 'Basic Structure Doctrine' was established in the Kesavananda Bharati case (1973).",
        "Article 21 is often called the 'heart' of Fundamental Rights, expanding to include privacy, clean environment, and more."
      ],
      'Corporate Law': [
        "The Companies Act 2013 introduced the concept of 'One Person Company' (OPC) for the first time in India.",
        "CSR (Corporate Social Responsibility) is mandatory for companies meeting specific turnover thresholds under Section 135."
      ]
    };
    const list = facts[category] || ["Law is an ever-evolving field. Always check for the latest amendments!"];
    return list[Math.floor(Math.random() * list.length)];
  };

  const getStudyTip = (category: string) => {
    return `For **${category}**, the best strategy is to:\n1. Focus on landmark judgments first.\n2. Create a 'Comparative Table' between old and new sections (essential for BNS/BNSS).\n3. Use our practice MCQs after every chapter to lock in the memory.`;
  };

  const QuickAction = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-gold/10 text-slate-600 hover:text-gold border border-slate-200 hover:border-gold/30 rounded-xl text-xs font-ui font-bold transition-all whitespace-nowrap"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-[200] font-ui">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[90vw] sm:w-[400px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-ink to-ink/90 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
                  <GraduationCap className="w-6 h-6 text-ink" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg leading-none">Scholar AI</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-black">Legal Study Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[300px] scroll-smooth"
            >
              {chat.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gold text-ink font-bold rounded-tr-none' 
                      : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.type === 'glossary' && <BookOpen className="w-4 h-4 mb-2 text-gold font-bold" />}
                    {msg.type === 'fact' && <Sparkles className="w-4 h-4 mb-2 text-blue-500 font-bold" />}
                    {msg.type === 'tip' && <Lightbulb className="w-4 h-4 mb-2 text-amber-500 font-bold" />}
                    <div className="whitespace-pre-wrap">
                      {msg.content.split('**').map((part, idx) => 
                        idx % 2 === 1 ? <b key={idx}>{part}</b> : part
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 border-t border-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
              <QuickAction icon={Sparkles} label="Fast Fact" onClick={() => processQuery('Fact')} />
              <QuickAction icon={Lightbulb} label="Study Tip" onClick={() => processQuery('Study Strategy')} />
              <QuickAction icon={Search} label="Search Term" onClick={() => setQuery('What is ')} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-slate-50/50 border-t border-slate-100">
              <div className="relative">
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about a legal term..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gold text-ink flex items-center justify-center hover:bg-gold/80 disabled:opacity-30 transition-all active:scale-95"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ink text-white shadow-2xl flex items-center justify-center relative group border-2 border-gold/20"
      >
        <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping opacity-20 pointer-events-none" />
        {isOpen ? <X className="w-6 h-6" /> : (
          <>
            <GraduationCap className="w-7 h-7 text-gold absolute transition-all duration-300 group-hover:scale-110" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-ink text-[10px] font-black rounded-full flex items-center justify-center border-2 border-ink">
              AI
            </div>
          </>
        )}
      </motion.button>
    </div>
  );
}
