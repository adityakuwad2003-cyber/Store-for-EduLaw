import { motion } from 'framer-motion';
import { Eye, ShoppingCart, FileText, Check } from 'lucide-react';
import type { Note } from '@/types';
import { getCategoryColor } from '@/data/notes';
import { useCartStore } from '@/store';
import { Link } from 'react-router-dom';

interface NoteCardProps {
  note: Note;
  variant?: 'default' | 'compact' | 'featured';
  index?: number;
}

export function NoteCard({ note, variant = 'default', index = 0 }: NoteCardProps) {
  const { addNote, items } = useCartStore();
  
  const isInCart = items.some(item => item.type === 'note' && item.item.id === note.id);
  const categoryColor = getCategoryColor(note.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart) {
      addNote(note);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="doc-card group hover:shadow-xl transition-all duration-300 relative cat-border-dynamic"
        style={{ '--cat-color': categoryColor, '--cat-bg': `${categoryColor}15` } as any}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl z-10 cat-border-bg" />
        <div className="p-4 pl-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span 
                className="inline-block px-2 py-0.5 text-[10px] font-ui font-black uppercase tracking-widest rounded mb-2 cat-tag-dynamic"
              >
                {note.category}
              </span>
              <h3 className="font-display text-base text-slate-900 line-clamp-2 group-hover:text-gold transition-colors">
                {note.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-gold font-ui font-semibold">₹{note.price}</span>
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`p-2 rounded-lg transition-all ${
                isInCart 
                  ? 'bg-green-50 text-green-600 border border-green-100' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <style>{`
          .cat-border-bg { background-color: var(--cat-color); }
          .cat-tag-dynamic { background-color: var(--cat-bg); color: var(--cat-color); }
        `}</style>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, rotateX: 1, rotateY: 1 }}
      className="doc-card group hover:shadow-2xl transition-all duration-300 relative bg-white border border-slate-200 cat-card-dynamic"
      style={{ '--cat-color': categoryColor, '--cat-bg': `${categoryColor}15` } as any}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl z-10 cat-border-bg"
      />
      
      {/* Document Header */}
      <div className="p-5 pl-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-ui font-black uppercase tracking-widest rounded cat-tag-dynamic"
            >
              <FileText className="w-3 h-3" />
              {note.category}
            </span>
            {note.isNew && (
              <span className="px-2 py-0.5 text-[10px] font-ui font-black uppercase tracking-widest bg-gold/10 text-gold rounded">
                NEW
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-gold transition-colors font-bold">
          {note.title}
        </h3>
        
        <p className="text-sm text-slate-500 font-ui line-clamp-2 mb-4 leading-relaxed">
          {note.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-ui font-bold uppercase tracking-widest mb-4">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {note.totalPages} pages
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {note.previewPages} free preview
          </span>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display text-gold font-bold">₹{note.price}</span>
            {note.originalPrice && note.originalPrice > note.price && (
              <span className="text-sm text-slate-300 line-through">₹{note.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/product/${note.slug}`}
              className="px-3 py-1.5 text-sm font-ui font-medium text-slate hover:text-burgundy transition-colors"
            >
              Preview
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={isInCart}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-ui font-medium transition-all ${
                isInCart 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-burgundy text-parchment hover:bg-burgundy-light'
              }`}
            >
              {isInCart ? (
                <><Check className="w-4 h-4" /> Added</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Buy</>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .cat-border-bg { background-color: var(--cat-color); }
        .cat-tag-dynamic { background-color: var(--cat-bg); color: var(--cat-color); }
        .cat-card-dynamic { perspective: 1000px; transform-style: preserve-3d; }
      `}</style>
    </motion.div>
  );
}
