import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NoteCard } from '@/components/ui/NoteCard';
import { getAllNotes } from '@/lib/db';
import type { Note } from '@/types';

interface FeaturedNotesProps {
  variant?: 'featured' | 'new' | 'all';
  limit?: number;
  title?: string;
  subtitle?: string;
}

export function FeaturedNotes({
  variant = 'featured',
  limit = 8,
  title,
  subtitle
}: FeaturedNotesProps) {
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  useEffect(() => {
    getAllNotes().then(setAllNotes);
  }, []);

  const notes = variant === 'new'
    ? allNotes.filter(n => n.isNew)
    : allNotes.filter(n => n.isFeatured);

  const displayNotes = notes.slice(0, limit);

  const sectionTitle = title || (variant === 'featured' 
    ? 'Featured Notes' 
    : variant === 'new' 
      ? 'New Arrivals' 
      : 'Popular Notes');

  const sectionSubtitle = subtitle || (variant === 'featured'
    ? 'Handpicked notes by our legal experts'
    : variant === 'new'
      ? 'Latest additions to our library'
      : 'Most purchased notes this month');

  return (
    <section className="py-16 bg-parchment">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {variant === 'new' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/20 text-gold rounded text-xs font-ui font-medium">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </span>
              )}
              <h2 className="font-display text-3xl lg:text-4xl text-ink">
                {sectionTitle}
              </h2>
            </div>
            <p className="font-body text-mutedgray">
              {sectionSubtitle}
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-burgundy font-ui font-medium hover:underline"
          >
            View all notes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Notes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayNotes.map((note, index) => (
            <NoteCard key={note.id} note={note} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
