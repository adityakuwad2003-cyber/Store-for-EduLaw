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
        className="doc-card group hover:shadow-xl transition-all duration-300"
      >
        <div 
          className="category-bar"
          style={{ backgroundColor: categoryColor }}
        />
        <div className="p-4 pl-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span 
                className="inline-block px-2 py-0.5 text-xs font-ui font-medium rounded mb-2"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
              >
                {note.category}
              </span>
              <h3 className="font-display text-base text-ink line-clamp-2 group-hover:text-burgundy transition-colors">
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
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-parchment'
              }`}
            >
              {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="doc-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div 
        className="category-bar"
        style={{ backgroundColor: categoryColor }}
      />
      
      {/* Document Header */}
      <div className="p-5 pl-6">
        <div className="ruled-header mb-4">
          <div className="flex items-center justify-between">
            <span 
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-ui font-medium rounded"
              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
            >
              <FileText className="w-3 h-3" />
              {note.category}
            </span>
            {note.isNew && (
              <span className="px-2 py-0.5 text-xs font-ui font-medium bg-gold/20 text-gold rounded">
                NEW
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg text-ink mb-2 line-clamp-2 group-hover:text-burgundy transition-colors">
          {note.title}
        </h3>
        
        <p className="text-sm text-mutedgray font-body line-clamp-2 mb-4">
          {note.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-mutedgray font-ui mb-4">
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
        <div className="flex items-center justify-between pt-3 border-t border-parchment-dark">
          <div className="flex items-center gap-2">
            <span className="text-xl font-display text-gold">₹{note.price}</span>
            {note.originalPrice && note.originalPrice > note.price && (
              <span className="text-sm text-mutedgray line-through">₹{note.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/notes/${note.slug}`}
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
    </motion.div>
  );
}
