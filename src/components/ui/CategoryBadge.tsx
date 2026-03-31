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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 ${
        isActive 
          ? 'ring-2 ring-offset-2' 
          : 'hover:shadow-md'
      }`}
      style={{
        backgroundColor: isActive ? color : `${color}15`,
        color: isActive ? 'white' : color,
        '--tw-ring-color': color,
      } as React.CSSProperties}
    >
      <Icon className="w-4 h-4" />
      <span className="font-ui font-medium text-sm">{name}</span>
      {noteCount !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          isActive ? 'bg-white/20' : 'bg-white/50'
        }`}>
          {noteCount}
        </span>
      )}
    </motion.button>
  );
}

export function CategoryChip({ name, slug, color, isActive = false, onClick }: CategoryBadgeProps) {
  const Icon = iconMap[slug] || FileText;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 min-w-[100px] ${
        isActive 
          ? 'shadow-lg' 
          : 'hover:shadow-md bg-white'
      }`}
      style={{
        backgroundColor: isActive ? color : undefined,
      }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: isActive ? 'white' : color }} />
      </div>
      <span 
        className="font-ui font-medium text-xs text-center"
        style={{ color: isActive ? 'white' : '#1f2937' }}
      >
        {name}
      </span>
    </motion.button>
  );
}
