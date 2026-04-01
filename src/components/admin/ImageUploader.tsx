import { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
  maxSizeMB?: number;
  aspectRatio?: string;
  className?: string;
}

export function ImageUploader({ 
  label, 
  value, 
  onChange, 
  onUpload,
  maxSizeMB = 2,
  aspectRatio = 'aspect-video',
  className = '' 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Basic Validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    if (onUpload) {
      setUploading(true);
      try {
        const url = await onUpload(file);
        onChange(url);
      } catch (err) {
        setError('Failed to upload image. Please try again.');
        console.error(err);
      } finally {
        setUploading(false);
      }
    } else {
      // Offline/Local preview if no upload handler
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [maxSizeMB, onUpload, onChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-ui text-parchment/60 uppercase tracking-widest font-semibold ml-1">
        {label}
      </label>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative ${aspectRatio} rounded-2xl border-2 border-dashed transition-all overflow-hidden bg-white/5 flex flex-col items-center justify-center group ${
          isDragging ? 'border-gold bg-gold/10 scale-[0.99]' : 'border-white/10 hover:border-gold/30'
        } ${error ? 'border-red-500/50 bg-red-500/5' : ''}`}
      >
        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img 
                src={value} 
                alt="Upload preview" 
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 active:scale-95 transition-all shadow-xl"
                  title="Remove Image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 text-center px-6"
            >
              <div className={`p-4 rounded-2xl ${isDragging ? 'bg-gold text-ink' : 'bg-white/10 text-gold'} transition-all`}>
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-ui font-medium text-parchment">
                  {isDragging ? 'Drop to upload' : 'Click or Drag image here'}
                </p>
                <p className="text-xs text-parchment/40 mt-1 uppercase tracking-widest font-semibold font-ui">
                  PNG, JPG, WEBP (MAX {maxSizeMB}MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white text-[10px] px-3 py-2 rounded-lg font-ui font-bold uppercase tracking-wider backdrop-blur-sm shadow-xl flex items-center gap-2">
            <X className="w-3 h-3" />
            {error}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center backdrop-blur-sm z-10">
            <Loader2 className="w-10 h-10 animate-spin text-gold mb-3" />
            <p className="text-gold font-ui text-xs uppercase tracking-widest font-bold">Uploading Assets...</p>
          </div>
        )}
      </div>
    </div>
  );
}
