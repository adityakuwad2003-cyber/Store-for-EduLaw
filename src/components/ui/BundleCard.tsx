import { motion } from 'framer-motion';
import { ShoppingCart, Check, Sparkles, Package } from 'lucide-react';
import type { Bundle } from '@/types';
import { useCartStore } from '@/store';
import { ShareButton } from './ShareButton';

interface BundleCardProps {
  bundle: Bundle;
  index?: number;
  isCustom?: boolean;
}

export function BundleCard({ bundle, index = 0, isCustom = false }: BundleCardProps) {
  const { addBundle, items } = useCartStore();
  
  const isInCart = items.some(item => item.type === 'bundle' && item.item.id === bundle.id);

  const handleAddToCart = () => {
    if (!isInCart) {
      addBundle(bundle);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        bundle.tag?.includes('Best') 
          ? 'bg-gradient-to-br from-burgundy to-burgundy-light text-parchment' 
          : 'bg-white border-2 border-parchment-dark'
      }`}
    >
      {/* Tag Badge */}
      {bundle.tag && (
        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-ui font-semibold rounded-bl-lg ${
          bundle.tag.includes('Best') 
            ? 'bg-gold text-ink' 
            : 'bg-burgundy text-parchment'
        }`}>
          {bundle.tag}
        </div>
      )}

      <div className="p-6">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
          bundle.tag?.includes('Best') 
            ? 'bg-white/20' 
            : 'bg-burgundy/10'
        }`}>
          {isCustom ? (
            <Sparkles className={`w-6 h-6 ${bundle.tag?.includes('Best') ? 'text-gold' : 'text-burgundy'}`} />
          ) : (
            <Package className={`w-6 h-6 ${bundle.tag?.includes('Best') ? 'text-gold' : 'text-burgundy'}`} />
          )}
        </div>

        {/* Title */}
        <h3 className={`font-display text-xl mb-2 ${
          bundle.tag?.includes('Best') ? 'text-parchment' : 'text-ink'
        }`}>
          {bundle.name}
        </h3>
        
        <p className={`text-sm mb-4 ${
          bundle.tag?.includes('Best') ? 'text-parchment/80' : 'text-mutedgray'
        }`}>
          {bundle.description}
        </p>

        {/* Subjects Count */}
        <div className={`flex items-center gap-2 mb-4 ${
          bundle.tag?.includes('Best') ? 'text-parchment/70' : 'text-mutedgray'
        }`}>
          <Package className="w-4 h-4" />
          <span className="font-ui">
            {bundle.noteIds.length > 0 ? `${bundle.noteIds.length} subjects` : 'Any ' + bundle.name.split(' ')[0].toLowerCase() + ' subjects'}
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-3 mb-6">
          <span className={`text-3xl font-display ${
            bundle.tag?.includes('Best') ? 'text-gold' : 'text-gold'
          }`}>
            ₹{bundle.price}
          </span>
          <span className={`text-sm line-through mb-1 ${
            bundle.tag?.includes('Best') ? 'text-parchment/50' : 'text-mutedgray'
          }`}>
            ₹{bundle.originalPrice}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            bundle.tag?.includes('Best') 
              ? 'bg-gold/20 text-gold' 
              : 'bg-green-100 text-green-600'
          }`}>
            Save {bundle.savingsPercent}%
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleAddToCart}
          disabled={isInCart}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-ui font-medium transition-all ${
            isInCart
              ? 'bg-green-100 text-green-600'
              : bundle.tag?.includes('Best')
                ? 'bg-gold text-ink hover:bg-gold-light'
                : 'bg-burgundy text-parchment hover:bg-burgundy-light'
          }`}
        >
          {isInCart ? (
            <><Check className="w-5 h-5" /> Added to Cart</>
          ) : (
            <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
          )}
        </button>

        {/* Share row */}
        <div className="mt-3 flex justify-center">
          <ShareButton
            title={bundle.name}
            description={bundle.description}
            price={bundle.price}
            originalPrice={bundle.originalPrice}
            url={`${window.location.origin}/marketplace`}
            variant="pill"
          />
        </div>
      </div>
    </motion.div>
  );
}
