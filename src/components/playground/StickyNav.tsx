import { useState, useEffect } from 'react';
import { Zap, Scale, FileText, Brain, Newspaper, BookOpen } from 'lucide-react';

const SECTIONS = [
  { id: 'daily-tools',  label: 'Daily Tools',     icon: Zap },
  { id: 'case-law',     label: 'Case Laws',        icon: Scale },
  { id: 'digest',       label: 'Judgment Digest',  icon: FileText },
  { id: 'legal-news',   label: 'Legal News',       icon: Newspaper },
  { id: 'flashcards',   label: 'Flashcards',       icon: Brain },
  { id: 'blogs',        label: 'Insights',         icon: Newspaper },
  { id: 'glossary',     label: 'Lexicon',          icon: BookOpen },
];

export function StickyNav() {
  const [active, setActive] = useState('daily-tools');

  // On mount, scroll to hash if present in URL
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActive(hash);
        }, 350);
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Page sections" className="sticky top-[64px] z-40 bg-white/90 backdrop-blur-md border-b border-ink/8 shadow-sm">
      <div className="section-container px-4">
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-2">
          {SECTIONS.map(s => (
            <button key={s.id}
              onClick={() => {
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update URL hash so the link is shareable
                window.history.replaceState(null, '', `#${s.id}`);
                setActive(s.id);
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-ui text-xs font-bold transition-all whitespace-nowrap ${active === s.id ? 'bg-burgundy text-white' : 'text-ink/50 hover:text-ink hover:bg-ink/5'}`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
