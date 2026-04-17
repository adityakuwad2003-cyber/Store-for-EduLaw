import React from 'react';

/**
 * Pixel-perfect SVG Brand Logos for EduLaw.
 * Support standard Lucide-style sizing and color passing.
 */

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const InstagramLogo = ({ size = 20, className, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const TelegramLogo = ({ size = 20, className, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const WhatsAppLogo = ({ size = 24, className, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.605 6.01L0 24l6.117-1.605a11.815 11.815 0 005.93 1.587h.005c6.634 0 12.032-5.396 12.035-12.03a11.782 11.782 0 00-3.48-8.514z" />
  </svg>
);

export const GoogleLogo = ({ size = 20, className, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    className={className}
    {...props}
  >
    <path d="M44.5 20H24V28.5H35.8C34.7 33.9 30.1 37.5 24 37.5C16.5 37.5 10.5 31.5 10.5 24C10.5 16.5 16.5 10.5 24 10.5C27.4 10.5 30.5 11.8 32.8 13.9L39.2 7.5C35.2 3.8 29.8 1.5 24 1.5C11.6 1.5 1.5 11.6 1.5 24C1.5 36.4 11.6 46.5 24 46.5C36 46.5 45 37.5 45 24C45 22.6 44.8 21.3 44.5 20Z" fill="#4285F4" />
    <path d="M44.5 20H24V28.5H35.8C35.1 31.1 33.6 33.3 31.5 35L38.4 41.3C42.3 37.5 45 31.4 45 24C45 22.6 44.8 21.3 44.5 20Z" fill="#34A853" />
    <path d="M24 46.5C30.3 46.5 35.8 44.3 39.8 40.7L32.9 34.4C30.6 36 27.5 37.5 24 37.5C18.1 37.5 13.1 33.5 11.3 28L4.3 33.4C8.2 41.1 15.5 46.5 24 46.5Z" fill="#FBBC05" />
    <path d="M11.3 28C10.8 26.7 10.5 25.4 10.5 24C10.5 22.6 10.8 21.3 11.3 20L4.3 14.6C2.5 17.4 1.5 20.6 1.5 24C1.5 27.4 2.5 30.6 4.3 33.4L11.3 28Z" fill="#EA4335" />
  </svg>
);
