import { FileText, Scale, Landmark, Building2, Users, Gavel, Shield, BookOpen, Search, ClipboardList, PenTool, Handshake, Scroll, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryBadgeProps {
  name: string;
  slug: string;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
  noteCount?: number;
}

const iconMap: Record<string, React.ElementType> = {
  'criminal-law': Scale,
  'constitutional-law': Landmark,
  'civil-law': FileText,
  'corporate-law': Building2,
  'family-law': Users,
  'special-acts': Gavel,
  'public-law': Shield,
  'foundation': BookOpen,
  'evidence': Search,
  'criminal-procedure': ClipboardList,
  'drafting': PenTool,
  'adr': Handshake,
  'procedural': Scroll,
  'international-law': Globe,
};

export function CategoryBadge({ name, slug, color, isActive = false, onClick, noteCount }: CategoryBadgeProps) {
  const Icon = iconMap[slug] || FileText;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 cat-badge-dynamic ${
        isActive 
          ? 'ring-2 ring-offset-2' 
          : 'hover:shadow-md'
      }`}
      style={{
        '--cat-color': color,
        '--cat-bg': isActive ? color : `${color}15`,
        '--cat-text': isActive ? 'white' : color,
        '--tw-ring-color': color,
      } as React.CSSProperties}
      aria-pressed={isActive}
      aria-label={`Category: ${name}`}
    >
      <Icon className="w-4 h-4 text-cat-text" />
      <span className="font-ui font-medium text-sm text-cat-text">{name}</span>
      {noteCount !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          isActive ? 'bg-white/20' : 'bg-white/50'
        }`}>
          {noteCount}
        </span>
      )}
      <style>{`
        .cat-badge-dynamic { background-color: var(--cat-bg); }
        .text-cat-text { color: var(--cat-text); }
      `}</style>
    </motion.button>
  );
}

export function CategoryChip({ name, slug, color, isActive = false, onClick }: CategoryBadgeProps) {
  const Icon = iconMap[slug] || FileText;

  return (
    <motion.button
      whileHover={{ y: -4, rotateX: 5, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col flex-1 items-center justify-between gap-3 p-4 rounded-xl transition-all duration-300 min-w-[110px] min-h-[110px] h-full cat-chip-dynamic ${
        isActive 
          ? 'shadow-lg ring-2 ring-white/20' 
          : 'hover:shadow-xl hover:shadow-parchment-dark/50 bg-white'
      }`}
      style={{
        '--cat-color': color,
        '--cat-bg': isActive ? color : 'transparent',
        '--icon-bg': isActive ? 'rgba(255,255,255,0.2)' : `${color}15`,
        '--icon-color': isActive ? 'white' : color,
        '--text-color': isActive ? 'white' : '#1f2937',
      } as React.CSSProperties}
      aria-pressed={isActive}
      aria-label={`Category: ${name}`}
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 icon-bg-dynamic">
        <Icon className="w-6 h-6 icon-color-dynamic" />
      </div>
      <span className="font-ui font-medium text-[13px] text-center leading-tight mt-auto text-color-dynamic">
        {name}
      </span>
      <style>{`
        .cat-chip-dynamic { background-color: var(--cat-bg); perspective: 1000px; transform-style: preserve-3d; }
        .icon-bg-dynamic { background-color: var(--icon-bg); }
        .icon-color-dynamic { color: var(--icon-color); }
        .text-color-dynamic { color: var(--text-color); }
      `}</style>
    </motion.button>
  );
}
