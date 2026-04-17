import { Link, useLocation } from 'react-router-dom';
import { ScalesOfJustice3D } from '@/components/ui/LegalSVGs';
import { SEO } from '@/components/SEO';

export function NotFound() {
  const location = useLocation();
  return (
    <div className="pt-20 min-h-screen bg-parchment flex items-center justify-center px-4">
      <SEO title="Page Not Found — EduLaw" noindex />
      <div className="text-center max-w-md">
        <div className="w-32 h-32 mx-auto mb-6 opacity-30">
          <ScalesOfJustice3D className="w-full h-full" />
        </div>
        <h1 className="font-display text-6xl text-ink mb-2">404</h1>
        <p className="font-display text-xl text-ink mb-3">Page Not Found</p>
        <p className="font-body text-mutedgray mb-8 text-sm">
          The page <code className="bg-parchment-dark px-1.5 py-0.5 rounded text-xs">{location.pathname}</code> does not exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-burgundy text-parchment rounded-xl font-ui font-semibold text-sm hover:bg-burgundy-light transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            to="/marketplace"
            className="px-6 py-3 border border-parchment-dark rounded-xl font-ui text-sm text-ink hover:bg-parchment-dark transition-colors"
          >
            Browse Notes
          </Link>
        </div>
      </div>
    </div>
  );
}
