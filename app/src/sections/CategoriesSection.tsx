import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/data/notes';
import { CategoryChip } from '@/components/ui/CategoryBadge';
import { Link } from 'react-router-dom';

export function CategoriesSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 bg-parchment">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="font-display text-3xl lg:text-4xl text-ink mb-2">
              Browse by <span className="text-burgundy">Category</span>
            </h2>
            <p className="font-body text-mutedgray">
              Find notes organized by subject area
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-lg bg-white border border-parchment-dark hover:border-burgundy hover:text-burgundy transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-lg bg-white border border-parchment-dark hover:border-burgundy hover:text-burgundy transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Categories Scroll */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="snap-start"
              >
                <Link to={`/marketplace?category=${category.slug}`}>
                  <CategoryChip
                    name={category.name}
                    slug={category.slug}
                    color={category.color}
                    isActive={activeCategory === category.slug}
                    onClick={() => setActiveCategory(activeCategory === category.slug ? null : category.slug)}
                    noteCount={category.noteCount}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-burgundy font-ui font-medium hover:underline"
          >
            View all categories
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
