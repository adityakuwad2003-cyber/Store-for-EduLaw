import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function CountdownTimer({ className = '' }: { className?: string }) {
  const [secs, setSecs] = useState(getSecondsUntilMidnight);

  useEffect(() => {
    const t = setInterval(() => setSecs(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Clock className="w-3 h-3 text-rose-500 shrink-0 animate-pulse" />
      <span className="text-[11px] font-ui font-bold text-rose-600">
        Offer ends in{' '}
        <span className="font-mono tracking-tight">{pad(h)}:{pad(m)}:{pad(s)}</span>
      </span>
    </div>
  );
}
