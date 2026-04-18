import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { pdfjs } from 'react-pdf';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Serve worker from same origin so it passes CSP worker-src 'self'
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// ── Stale-chunk auto-reload ───────────────────────────────────────────────────
// After a new Vercel deployment, Vite generates new JS chunk hashes.  Any user
// who still has the OLD version open will get "Failed to fetch dynamically
// imported module" when React tries to lazy-load a chunk that no longer exists
// on the CDN.  We catch that error here and do a single hard reload so the
// browser picks up the new bundle silently — the user never sees the error.
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

// Fallback for browsers that don't fire vite:preloadError
window.addEventListener('error', (e) => {
  const msg = e.message || '';
  if (msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('Unable to preload CSS')) {
    window.location.reload();
  }
}, { capture: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
