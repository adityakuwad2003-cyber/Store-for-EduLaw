import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';

interface CouponInputProps {
  onApply: (code: string) => Promise<boolean>;
  onRemove: () => void;
  appliedCode: string | null;
  discountAmount: number;
}

export function CouponInput({ onApply, onRemove, appliedCode, discountAmount }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onApply(code.trim().toUpperCase());
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setCode('');
    setError(null);
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-ui font-medium text-green-700">{appliedCode}</p>
            <p className="text-xs text-green-600">₹{discountAmount} discount applied</p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 hover:bg-green-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-green-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedgray" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="w-full pl-10 pr-4 py-2.5 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim() || isLoading}
          className="px-4 py-2.5 bg-burgundy text-parchment rounded-lg font-ui font-medium text-sm hover:bg-burgundy-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-ui">{error}</p>
      )}
    </div>
  );
}
