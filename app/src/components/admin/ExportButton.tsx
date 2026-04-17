import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportButtonProps {
  data: any[];
  filename: string;
  onExport?: (format: 'csv' | 'pdf') => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  label?: string;
}

export function ExportButton({ 
  data, 
  filename, 
  onExport, 
  className = '', 
  variant = 'secondary',
  label = 'Export' 
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format);
    setIsOpen(false);

    try {
      if (onExport) {
        await onExport(format);
      } else {
        // Fallback or generic logic could go here
        // (Simplified for this component shell)
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`Exporting ${data.length} records to ${filename}.${format}`);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const getVariantStyles = () => {
    if (variant === 'primary') return 'bg-gold text-ink hover:bg-[#b8922a] border-gold';
    return 'bg-white/5 border-white/10 text-parchment/60 hover:bg-white/10 hover:text-parchment hover:border-gold/30';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!!exporting}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-sm font-ui font-semibold ${getVariantStyles()} active:scale-95 disabled:opacity-50`}
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{exporting ? 'Generating...' : success ? 'Saved' : label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for easy closing */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 z-50 w-48 bg-ink border border-white/10 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl p-2 overflow-hidden ring-1 ring-gold/10"
            >
              <div className="px-3 py-2 text-[10px] font-ui text-parchment/40 uppercase tracking-widest font-bold border-b border-white/5 mb-1">
                Choose Format
              </div>
              
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gold/10 hover:text-gold rounded-lg transition-all text-left text-sm text-parchment/70 group"
              >
                <FileSpreadsheet className="w-4 h-4 text-parchment/30 group-hover:text-gold transition-colors" />
                <span>Comma Separated (CSV)</span>
              </button>
              
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gold/10 hover:text-gold rounded-lg transition-all text-left text-sm text-parchment/70 group"
              >
                <FileText className="w-4 h-4 text-parchment/30 group-hover:text-gold transition-colors" />
                <span>Document Format (PDF)</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
