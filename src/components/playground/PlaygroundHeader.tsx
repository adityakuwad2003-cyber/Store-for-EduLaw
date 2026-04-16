import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

interface PlaygroundHeaderProps {
  title: string;
}

export const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({ title }) => {
  return (
    <div className="bg-white border-b border-ink/5 sticky top-16 z-30 py-4 shadow-sm">
      <div className="section-container px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/legal-playground"
              className="p-2 hover:bg-ink/5 rounded-full text-ink/40 hover:text-burgundy transition-all"
              title="Back to Playground Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl sm:text-2xl text-ink">{title}</h1>
          </div>
          
          <Link 
            to="/legal-playground"
            className="flex items-center gap-2 px-4 py-2 bg-burgundy/5 text-burgundy rounded-xl font-ui text-[11px] font-black uppercase tracking-widest hover:bg-burgundy hover:text-white transition-all shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Playground Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundHeader;
