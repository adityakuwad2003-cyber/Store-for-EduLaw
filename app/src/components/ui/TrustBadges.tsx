import { Shield, Zap, Lock, Clock, CheckCircle } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
  className?: string;
}

const badges = [
  { icon: Shield, text: 'Secure Payment', subtext: 'Razorpay Protected' },
  { icon: Zap, text: 'Instant Download', subtext: 'Get notes immediately' },
  { icon: Lock, text: 'Watermarked PDF', subtext: 'Personalized for you' },
  { icon: Clock, text: '24/7 Access', subtext: 'Read anytime, anywhere' },
];

export function TrustBadges({ variant = 'horizontal', size = 'md', className = '' }: TrustBadgesProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  if (variant === 'vertical') {
    return (
      <div className={`space-y-3 ${className}`}>
        {badges.map((badge, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center">
              <badge.icon className={`${iconSize} text-burgundy`} />
            </div>
            <div>
              <p className={`font-ui font-medium text-ink ${textSize}`}>{badge.text}</p>
              <p className="text-xs text-mutedgray">{badge.subtext}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 ${className}`}>
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-2">
          <badge.icon className={`${iconSize} text-gold`} />
          <span className={`font-ui text-mutedgray ${textSize}`}>{badge.text}</span>
        </div>
      ))}
    </div>
  );
}

export function TrustPill() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-parchment-dark">
      <CheckCircle className="w-4 h-4 text-green-500" />
      <span className="text-sm font-ui text-mutedgray">Razorpay Secured</span>
      <span className="w-px h-4 bg-parchment-dark" />
      <Shield className="w-4 h-4 text-burgundy" />
      <span className="text-sm font-ui text-mutedgray">SSL Encrypted</span>
    </div>
  );
}
