import { motion } from 'framer-motion';

// 3D Scales of Justice SVG
export function ScalesOfJustice3D({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base */}
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C97A" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A08030" />
        </linearGradient>
        <linearGradient id="pillarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B2E42" />
          <stop offset="50%" stopColor="#6B1E2E" />
          <stop offset="100%" stopColor="#4A1520" />
        </linearGradient>
        <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Base Platform */}
      <ellipse cx="100" cy="220" rx="60" ry="15" fill="url(#goldGrad)" filter="url(#shadow3d)" />
      <ellipse cx="100" cy="215" rx="50" ry="12" fill="url(#pillarGrad)" />
      
      {/* Main Pillar */}
      <rect x="92" y="60" width="16" height="150" rx="2" fill="url(#pillarGrad)" filter="url(#shadow3d)" />
      
      {/* Decorative rings on pillar */}
      <rect x="90" y="70" width="20" height="4" rx="1" fill="url(#goldGrad)" />
      <rect x="90" y="180" width="20" height="4" rx="1" fill="url(#goldGrad)" />
      
      {/* Top Crown */}
      <path d="M85 60 L100 35 L115 60 Z" fill="url(#goldGrad)" filter="url(#shadow3d)" />
      <circle cx="100" cy="35" r="8" fill="url(#goldGrad)" />
      
      {/* Balance Beam */}
      <rect x="20" y="55" width="160" height="8" rx="2" fill="url(#goldGrad)" filter="url(#shadow3d)" />
      
      {/* Center pivot */}
      <circle cx="100" cy="59" r="10" fill="url(#pillarGrad)" stroke="url(#goldGrad)" strokeWidth="2" />
      
      {/* Left Scale */}
      <motion.g 
        initial={{ rotate: -5 }}
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: '40px 59px' }}
      >
        <line x1="40" y1="59" x2="40" y2="110" stroke="url(#goldGrad)" strokeWidth="2" />
        <ellipse cx="40" cy="120" rx="30" ry="10" fill="url(#pillarGrad)" opacity="0.9" />
        <ellipse cx="40" cy="115" rx="25" ry="8" fill="url(#goldGrad)" opacity="0.3" />
      </motion.g>
      
      {/* Right Scale */}
      <motion.g 
        initial={{ rotate: 5 }}
        animate={{ rotate: [5, -5, 5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: '160px 59px' }}
      >
        <line x1="160" y1="59" x2="160" y2="110" stroke="url(#goldGrad)" strokeWidth="2" />
        <ellipse cx="160" cy="120" rx="30" ry="10" fill="url(#pillarGrad)" opacity="0.9" />
        <ellipse cx="160" cy="115" rx="25" ry="8" fill="url(#goldGrad)" opacity="0.3" />
      </motion.g>
    </svg>
  );
}

// 3D Book Stack SVG
export function LawBooks3D({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bookRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B2E42" />
          <stop offset="50%" stopColor="#6B1E2E" />
          <stop offset="100%" stopColor="#4A1520" />
        </linearGradient>
        <linearGradient id="bookGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C97A" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A08030" />
        </linearGradient>
        <filter id="bookShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="4" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.25"/>
        </filter>
      </defs>
      
      {/* Bottom Book */}
      <g filter="url(#bookShadow)">
        <rect x="30" y="130" width="140" height="35" rx="3" fill="url(#bookRed)" />
        <rect x="35" y="132" width="130" height="31" rx="2" fill="#4A1520" opacity="0.5" />
        <rect x="40" y="140" width="80" height="3" rx="1" fill="url(#bookGold)" opacity="0.6" />
        <rect x="40" y="150" width="60" height="2" rx="1" fill="url(#bookGold)" opacity="0.4" />
      </g>
      
      {/* Middle Book */}
      <g filter="url(#bookShadow)">
        <rect x="35" y="95" width="130" height="32" rx="3" fill="url(#bookRed)" />
        <rect x="40" y="97" width="120" height="28" rx="2" fill="#4A1520" opacity="0.5" />
        <rect x="45" y="104" width="70" height="3" rx="1" fill="url(#bookGold)" opacity="0.6" />
        <rect x="45" y="113" width="50" height="2" rx="1" fill="url(#bookGold)" opacity="0.4" />
      </g>
      
      {/* Top Book */}
      <g filter="url(#bookShadow)">
        <rect x="40" y="60" width="120" height="30" rx="3" fill="url(#bookRed)" />
        <rect x="45" y="62" width="110" height="26" rx="2" fill="#4A1520" opacity="0.5" />
        <rect x="50" y="68" width="60" height="3" rx="1" fill="url(#bookGold)" opacity="0.6" />
        <rect x="50" y="76" width="45" height="2" rx="1" fill="url(#bookGold)" opacity="0.4" />
      </g>
      
      {/* Bookmark */}
      <path d="M140 65 L140 95 L150 88 L160 95 L160 65 Z" fill="url(#bookGold)" filter="url(#bookShadow)" />
      
      {/* Decorative elements */}
      <circle cx="55" cy="75" r="8" fill="url(#bookGold)" opacity="0.3" />
      <text x="55" y="79" textAnchor="middle" fontSize="10" fill="#C9A84C" fontWeight="bold">§</text>
    </svg>
  );
}

// 3D Gavel SVG
export function Gavel3D({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5A2B" />
          <stop offset="50%" stopColor="#6B4423" />
          <stop offset="100%" stopColor="#4A3018" />
        </linearGradient>
        <linearGradient id="goldGavel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C97A" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A08030" />
        </linearGradient>
        <filter id="gavelShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="5" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Sound block */}
      <ellipse cx="100" cy="165" rx="50" ry="15" fill="url(#woodGrad)" filter="url(#gavelShadow)" />
      <ellipse cx="100" cy="160" rx="45" ry="12" fill="#4A3018" />
      
      {/* Gavel head */}
      <motion.g 
        initial={{ rotate: -15 }}
        animate={{ rotate: [-15, 0, -15] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        style={{ transformOrigin: '100px 100px' }}
        filter="url(#gavelShadow)"
      >
        {/* Handle */}
        <rect x="95" y="40" width="15" height="100" rx="3" fill="url(#woodGrad)" />
        
        {/* Gavel head */}
        <rect x="55" y="35" width="90" height="35" rx="5" fill="url(#goldGavel)" />
        <rect x="60" y="40" width="80" height="25" rx="3" fill="#C9A84C" opacity="0.5" />
        
        {/* Decorative bands */}
        <rect x="70" y="35" width="8" height="35" rx="1" fill="#A08030" />
        <rect x="122" y="35" width="8" height="35" rx="1" fill="#A08030" />
      </motion.g>
    </svg>
  );
}

// 3D Scroll/Document SVG
export function LegalScroll3D({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5F0E8" />
          <stop offset="50%" stopColor="#EDE5D0" />
          <stop offset="100%" stopColor="#E5DCC8" />
        </linearGradient>
        <linearGradient id="scrollGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C97A" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A08030" />
        </linearGradient>
        <filter id="scrollShadow" x="-10%" y="-5%" width="120%" height="110%">
          <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      {/* Main scroll body */}
      <rect x="40" y="30" width="120" height="180" rx="5" fill="url(#scrollGrad)" filter="url(#scrollShadow)" />
      
      {/* Top roll */}
      <rect x="35" y="25" width="130" height="20" rx="10" fill="url(#scrollGold)" filter="url(#scrollShadow)" />
      <ellipse cx="100" cy="30" rx="60" ry="8" fill="#E8C97A" opacity="0.5" />
      
      {/* Bottom roll */}
      <rect x="35" y="195" width="130" height="20" rx="10" fill="url(#scrollGold)" filter="url(#scrollShadow)" />
      <ellipse cx="100" cy="210" rx="60" ry="8" fill="#A08030" opacity="0.3" />
      
      {/* Text lines */}
      <g opacity="0.4">
        <rect x="55" y="55" width="90" height="3" rx="1" fill="#6B1E2E" />
        <rect x="55" y="70" width="80" height="3" rx="1" fill="#6B1E2E" />
        <rect x="55" y="85" width="85" height="3" rx="1" fill="#6B1E2E" />
        <rect x="55" y="100" width="70" height="3" rx="1" fill="#6B1E2E" />
        <rect x="55" y="115" width="90" height="3" rx="1" fill="#6B1E2E" />
        <rect x="55" y="130" width="75" height="3" rx="1" fill="#6B1E2E" />
        <rect x="55" y="145" width="85" height="3" rx="1" fill="#6B1E2E" />
        <rect x="55" y="160" width="60" height="3" rx="1" fill="#6B1E2E" />
      </g>
      
      {/* Seal/Stamp */}
      <circle cx="140" cy="160" r="18" fill="none" stroke="#6B1E2E" strokeWidth="2" opacity="0.5" />
      <circle cx="140" cy="160" r="14" fill="none" stroke="#6B1E2E" strokeWidth="1" opacity="0.3" />
      <text x="140" y="165" textAnchor="middle" fontSize="12" fill="#6B1E2E" opacity="0.6">§</text>
    </svg>
  );
}

// Floating Document Card 3D
export function DocumentCard3D({ 
  title, 
  subtitle, 
  delay = 0 
}: { 
  title: string; 
  subtitle: string; 
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      animate={{ 
        opacity: 1, 
        y: [0, -15, 0],
        rotateX: [-5, 5, -5],
        rotateY: [-3, 3, -3]
      }}
      transition={{ 
        opacity: { delay: delay + 0.3, duration: 0.5 },
        y: { delay: delay + 0.8, duration: 5, repeat: Infinity, ease: "easeInOut" },
        rotateX: { delay: delay + 0.8, duration: 6, repeat: Infinity, ease: "easeInOut" },
        rotateY: { delay: delay + 1, duration: 7, repeat: Infinity, ease: "easeInOut" }
      }}
      className="relative bg-white rounded-xl p-4 shadow-2xl border border-parchment-dark"
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Folded corner effect */}
      <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-t-[#C9A84C] border-l-[32px] border-l-transparent" />
      </div>
      
      {/* Content */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6B1E2E] to-[#8B2E42] flex items-center justify-center">
          <span className="text-parchment font-display text-lg">§</span>
        </div>
        <div>
          <p className="font-ui font-medium text-ink text-sm">{title}</p>
          <p className="font-ui text-xs text-mutedgray">{subtitle}</p>
        </div>
      </div>
      
      {/* Decorative lines */}
      <div className="mt-3 space-y-1.5">
        <div className="h-1.5 bg-parchment-dark rounded w-full" />
        <div className="h-1.5 bg-parchment-dark rounded w-3/4" />
        <div className="h-1.5 bg-parchment-dark rounded w-5/6" />
      </div>
    </motion.div>
  );
}

// Laurel Wreath SVG
export function LaurelWreath({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="laurelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#E8C97A" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
      </defs>
      
      {/* Left branch */}
      <g stroke="url(#laurelGrad)" strokeWidth="2" fill="none">
        <path d="M100 50 Q70 30 40 40" />
        <path d="M100 50 Q65 45 35 55" />
        <path d="M100 50 Q70 65 45 75" />
        <path d="M100 50 Q75 55 50 65" />
        <path d="M100 50 Q80 40 60 45" />
        <path d="M100 50 Q85 50 65 55" />
      </g>
      
      {/* Right branch */}
      <g stroke="url(#laurelGrad)" strokeWidth="2" fill="none">
        <path d="M100 50 Q130 30 160 40" />
        <path d="M100 50 Q135 45 165 55" />
        <path d="M100 50 Q130 65 155 75" />
        <path d="M100 50 Q125 55 150 65" />
        <path d="M100 50 Q120 40 140 45" />
        <path d="M100 50 Q115 50 135 55" />
      </g>
      
      {/* Leaves - Left */}
      {[30, 40, 50, 60, 70].map((y, i) => (
        <ellipse 
          key={`left-${i}`} 
          cx={45 + i * 5} 
          cy={y} 
          rx="8" 
          ry="4" 
          fill="url(#laurelGrad)" 
          transform={`rotate(${-20 + i * 5}, ${45 + i * 5}, ${y})`}
          opacity={0.8}
        />
      ))}
      
      {/* Leaves - Right */}
      {[30, 40, 50, 60, 70].map((y, i) => (
        <ellipse 
          key={`right-${i}`} 
          cx={155 - i * 5} 
          cy={y} 
          rx="8" 
          ry="4" 
          fill="url(#laurelGrad)" 
          transform={`rotate(${20 - i * 5}, ${155 - i * 5}, ${y})`}
          opacity={0.8}
        />
      ))}
      
      {/* Center ribbon */}
      <path d="M85 85 Q100 95 115 85" stroke="url(#laurelGrad)" strokeWidth="3" fill="none" />
      <circle cx="100" cy="88" r="5" fill="url(#laurelGrad)" />
    </svg>
  );
}

// Section Badge SVG
export function SectionBadge({ number, className = '' }: { number: string; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C97A" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A08030" />
        </linearGradient>
        <linearGradient id="badgeInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B1E2E" />
          <stop offset="100%" stopColor="#8B2E42" />
        </linearGradient>
      </defs>
      
      {/* Outer ring */}
      <circle cx="40" cy="40" r="38" stroke="url(#badgeGrad)" strokeWidth="4" fill="none" />
      <circle cx="40" cy="40" r="34" fill="url(#badgeInner)" />
      
      {/* Inner decorative ring */}
      <circle cx="40" cy="40" r="30" stroke="url(#badgeGrad)" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="40" cy="40" r="26" stroke="url(#badgeGrad)" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="4 4" />
      
      {/* Text */}
      <text x="40" y="35" textAnchor="middle" fontSize="10" fill="#C9A84C" fontWeight="bold">§</text>
      <text x="40" y="52" textAnchor="middle" fontSize="14" fill="#F5F0E8" fontWeight="bold">{number}</text>
    </svg>
  );
}
