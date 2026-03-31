import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notesData } from '@/data/notes';
import { Link } from 'react-router-dom';

interface SearchBarProps {
  variant?: 'hero' | 'nav' | 'compact';
  onSearch?: (query: string) => void;
}

export function SearchBar({ variant = 'compact', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof notesData>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = notesData.filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.category.toLowerCase().includes(query.toLowerCase()) ||
        note.subjectCode.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  if (variant === 'hero') {
    return (
      <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by subject, act, or topic..."
            className="w-full pl-14 pr-12 py-4 bg-white rounded-xl border-2 border-parchment-dark text-ink placeholder:text-mutedgray font-ui focus:outline-none focus:border-burgundy focus:ring-4 focus:ring-burgundy/10 transition-all shadow-lg"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-parchment-dark rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-mutedgray" />
            </button>
          )}
        </form>

        <AnimatePresence>
          {isOpen && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-parchment-dark overflow-hidden z-50"
            >
              {suggestions.map((note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 hover:bg-parchment/50 transition-colors border-b border-parchment-dark last:border-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center">
                    <Search className="w-4 h-4 text-burgundy" />
                  </div>
                  <div className="flex-1">
                    <p className="font-ui font-medium text-ink">{note.title}</p>
                    <p className="text-sm text-mutedgray">{note.category}</p>
                  </div>
                  <span className="text-gold font-display">₹{note.price}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedgray" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-8 py-2 bg-parchment-dark/50 rounded-lg border border-transparent text-sm font-ui text-ink placeholder:text-mutedgray focus:outline-none focus:border-burgundy/30 focus:bg-white transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-parchment-dark rounded transition-colors"
          >
            <X className="w-3 h-3 text-mutedgray" />
          </button>
        )}
      </form>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-parchment-dark overflow-hidden z-50"
          >
            {suggestions.map((note) => (
              <Link
                key={note.id}
                to={`/notes/${note.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 hover:bg-parchment/50 transition-colors border-b border-parchment-dark last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-ui font-medium text-ink text-sm truncate">{note.title}</p>
                  <p className="text-xs text-mutedgray">{note.category}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
