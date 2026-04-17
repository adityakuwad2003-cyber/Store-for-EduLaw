interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showSavings?: boolean;
}

export function PriceDisplay({ price, originalPrice, size = 'md', showSavings = false }: PriceDisplayProps) {
  const sizeClasses = {
    sm: { price: 'text-lg', original: 'text-sm', savings: 'text-xs' },
    md: { price: 'text-2xl', original: 'text-base', savings: 'text-sm' },
    lg: { price: 'text-4xl', original: 'text-xl', savings: 'text-base' },
  };

  const savings = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`font-display text-gold ${sizeClasses[size].price}`}>
        ₹{price.toLocaleString()}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className={`text-mutedgray line-through ${sizeClasses[size].original}`}>
            ₹{originalPrice.toLocaleString()}
          </span>
          {showSavings && savings > 0 && (
            <span className={`px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-ui font-medium ${sizeClasses[size].savings}`}>
              Save {savings}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
