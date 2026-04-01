import { useState, useRef, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

const PRESETS = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Yesterday', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
];

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayDate = () => {
    if (!value?.from) return 'Select Date Range';
    if (!value?.to || isSameDay(value.from, value.to)) {
      return format(value.from, 'MMM dd, yyyy');
    }
    return `${format(value.from, 'MMM dd')} - ${format(value.to, 'MMM dd, yyyy')}`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-sm font-ui ${
          isOpen 
            ? 'bg-gold/5 border-gold text-gold shadow-lg shadow-gold/10' 
            : 'bg-white/5 border-white/10 text-parchment/80 hover:border-gold/30 hover:bg-white/10'
        }`}
      >
        <CalendarIcon className={`w-4 h-4 ${isOpen ? 'text-gold' : 'text-parchment/40'}`} />
        <span className="font-medium">{displayDate()}</span>
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 z-[100] bg-ink/95 border border-white/10 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl p-4 flex gap-4 overflow-hidden"
          >
            <div className="w-40 border-r border-white/10 pr-2 flex flex-col gap-1 shrink-0">
              <span className="text-[10px] font-ui text-parchment/40 uppercase tracking-widest font-bold px-3 py-2">Quick Presets</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    onChange(preset.getValue());
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 text-left text-xs text-parchment/70 hover:text-gold hover:bg-white/5 rounded-lg transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="admin-calendar">
              <style>{`
                .admin-calendar .rdp { --rdp-accent-color: #C9A84C; --rdp-background-color: #C9A84C20; margin: 0; }
                .admin-calendar .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: #1A1A1A !important; font-weight: bold; }
                .admin-calendar .rdp-day_range_middle { background-color: var(--rdp-background-color) !important; color: #E8E8E8 !important; }
                .admin-calendar .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(255,255,255,0.05); }
                .admin-calendar .rdp-caption_label { font-family: 'DM Serif Display', serif; font-size: 1rem; color: #E8E8E8; }
                .admin-calendar .rdp-head_cell { font-family: 'IBM Plex Sans', sans-serif; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(232, 232, 232, 0.4); }
              `}</style>
              <DayPicker
                mode="range"
                selected={value}
                onSelect={onChange}
                numberOfMonths={1}
                className="font-ui text-parchment/90"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
