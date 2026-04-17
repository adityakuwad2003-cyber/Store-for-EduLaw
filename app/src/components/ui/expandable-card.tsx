"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableCardProps {
  title: string;
  src: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  classNameExpanded?: string;
  [key: string]: any;
}

export function ExpandableCard({
  title,
  src,
  description,
  children,
  className,
  classNameExpanded,
  ...props
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false);
      }
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };

    if (active) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [active]);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-md h-full w-full z-[100]"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <div
            className={cn(
              "fixed inset-0 grid place-items-center z-[110] sm:mt-16 before:pointer-events-none p-4 sm:p-0",
            )}
          >
            <motion.div
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              className={cn(
                "w-full max-w-[850px] h-full sm:h-[85vh] flex flex-col overflow-hidden sm:rounded-[2rem] bg-parchment shadow-2xl relative border border-gold/10",
                classNameExpanded,
              )}
              {...props}
            >
              <motion.div layoutId={`image-${title}-${id}`} className="relative h-72 sm:h-96 shrink-0">
                <img
                  src={src}
                  alt={title}
                  className="w-full h-full object-cover rounded-t-[2rem]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-parchment via-transparent" />
                
                <motion.button
                  aria-label="Close card"
                  layoutId={`button-${title}-${id}`}
                  className="absolute top-6 right-6 h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-ink transition-all shadow-lg z-20"
                  onClick={() => setActive(false)}
                >
                  <X size={20} />
                </motion.button>
              </motion.div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-12">
                <div className="mb-10 text-left">
                  <motion.p
                    layoutId={`description-${description}-${id}`}
                    className="text-gold font-ui font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-3"
                  >
                    {description}
                  </motion.p>
                  <motion.h3
                    layoutId={`title-${title}-${id}`}
                    className="font-display text-ink text-3xl sm:text-5xl leading-tight"
                  >
                    {title}
                  </motion.h3>
                </div>

                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="prose prose-slate max-w-none prose-p:font-body prose-p:text-ink/70 prose-p:text-lg prose-p:leading-relaxed prose-headings:font-display prose-headings:text-ink text-left"
                >
                  {children}
                </motion.div>
                
                <div className="h-20" /> {/* Spacer for scroll */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        role="dialog"
        aria-label={title}
        aria-modal="true"
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        className={cn(
          "group relative flex flex-col bg-white border border-ink/5 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-gold/30 transition-all cursor-pointer",
          className,
        )}
      >
        <motion.div layoutId={`image-${title}-${id}`} className="aspect-[16/10] overflow-hidden">
          <img
            src={src}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </motion.div>
        
        <div className="p-6 sm:p-8 flex-1 flex flex-col">
          <motion.p
            layoutId={`description-${description}-${id}`}
            className="text-gold font-ui font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mb-2 md:text-left"
          >
            {description}
          </motion.p>
          
          <div className="flex justify-between items-start gap-4">
            <motion.h3
              layoutId={`title-${title}-${id}`}
              className="font-display text-xl text-ink leading-tight group-hover:text-burgundy transition-colors line-clamp-2 md:text-left"
            >
              {title}
            </motion.h3>
            
            <motion.button
              aria-label="Open card"
              layoutId={`button-${title}-${id}`}
              className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-ink/5 text-ink/40 group-hover:bg-gold group-hover:text-ink transition-all"
            >
              <Plus size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
