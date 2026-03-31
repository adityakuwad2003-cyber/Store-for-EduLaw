import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Download, LogOut, User, ArrowRight,
  ShoppingBag, Shield, Loader2, AlertCircle, Clock, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getSecureDownloadUrl } from '@/lib/storage';

interface FileEntry { name: string; key: string; }

interface Purchase {
  id: string;
  productId: string;
  title: string;
  fileKey: string;
  fileKeys: FileEntry[];
  price: number;
  razorpay_payment_id: string;
  purchasedAt: string | null;
}

export function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Track which specific file is downloading: "productId::fileKey"
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const fetchPurchases = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/get-purchases', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to load purchases');
        const data = await res.json();
        setPurchases(data.purchases as Purchase[]);
      } catch (err) {
        console.error('Failed to fetch purchases:', err);
        toast.error('Could not load your library. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchases();
  }, [currentUser]);

  const handleDownload = async (purchase: Purchase, fileKey: string, fileName: string) => {
    if (!currentUser) return;
    if (!fileKey) { toast.error('Download link not configured for this file yet.'); return; }

    const trackingKey = `${purchase.productId}::${fileKey}`;
    setDownloadingKey(trackingKey);
    try {
      const token = await currentUser.getIdToken();
      const url = await getSecureDownloadUrl(fileKey, purchase.productId, token);

      // Trigger browser download with proper file name
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloading "${fileName}"...`);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error(err.message || 'Could not generate download link. Please try again.');
    } finally {
      setDownloadingKey(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="pt-20 min-h-screen bg-parchment flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-burgundy mx-auto mb-4" />
          <h1 className="font-display text-2xl text-ink mb-2">Please Log In</h1>
          <p className="text-mutedgray mb-6">You must be logged in to view your library.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-parchment rounded-xl font-ui font-medium">
            Go to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-parchment">
      {/* Header */}
      <div className="bg-ink py-12">
        <div className="section-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-14 h-14 rounded-full border-2 border-gold" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6B1E2E] to-[#8B2E42] flex items-center justify-center border-2 border-gold">
                  <User className="w-7 h-7 text-parchment" />
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl text-parchment">{currentUser.displayName || 'My Library'}</h1>
                <p className="text-parchment/60 text-sm">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-parchment rounded-xl hover:bg-white/20 transition-colors font-ui text-sm"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 shadow-card text-center">
            <BookOpen className="w-8 h-8 text-burgundy mx-auto mb-2" />
            <p className="font-display text-3xl text-ink">{purchases.length}</p>
            <p className="text-mutedgray text-sm">Documents Owned</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card text-center">
            <Shield className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="font-display text-3xl text-ink">∞</p>
            <p className="text-mutedgray text-sm">Lifetime Access</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card text-center col-span-2 sm:col-span-1">
            <ShoppingBag className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-display text-3xl text-ink">
              ₹{purchases.reduce((sum, p) => sum + (p.price || 0), 0)}
            </p>
            <p className="text-mutedgray text-sm">Total Spent</p>
          </div>
        </div>

        {/* My Documents */}
        <h2 className="font-display text-2xl text-ink mb-6">My Documents</h2>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-parchment-dark rounded w-3/4 mb-3" />
                <div className="h-4 bg-parchment-dark rounded w-1/2 mb-6" />
                <div className="h-10 bg-parchment-dark rounded-xl" />
              </div>
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <BookOpen className="w-16 h-16 text-parchment-dark mx-auto mb-4" />
            <h3 className="font-display text-xl text-ink mb-2">Your library is empty</h3>
            <p className="text-mutedgray mb-6">Purchase notes from the marketplace to access them here.</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-parchment rounded-xl font-ui font-medium hover:bg-burgundy-light transition-colors"
            >
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {purchases.map((purchase, index) => {
              // Resolve the file list — supports both old single-file and new multi-file
              const files: FileEntry[] =
                purchase.fileKeys?.length > 0
                  ? purchase.fileKeys
                  : purchase.fileKey
                  ? [{ name: purchase.title, key: purchase.fileKey }]
                  : [];

              return (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-card border border-parchment-dark hover:border-burgundy/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-burgundy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-ui font-semibold text-ink text-sm leading-tight mb-1 line-clamp-2">
                        {purchase.title}
                      </h3>
                      {purchase.purchasedAt && (
                        <p className="text-xs text-mutedgray flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(purchase.purchasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-mutedgray">ID: {purchase.razorpay_payment_id?.slice(-8) || '—'}</span>
                    <span className="font-display text-gold text-sm">₹{purchase.price}</span>
                  </div>

                  {/* File download buttons — one per file */}
                  {files.length === 0 ? (
                    <div className="w-full py-2.5 bg-parchment rounded-xl font-ui text-sm text-center text-mutedgray">
                      Files coming soon
                    </div>
                  ) : files.length === 1 ? (
                    // Single file — original UX
                    <button
                      onClick={() => handleDownload(purchase, files[0].key, files[0].name)}
                      disabled={downloadingKey === `${purchase.productId}::${files[0].key}`}
                      className="w-full py-2.5 bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] text-parchment rounded-xl font-ui font-medium text-sm hover:shadow-lg hover:shadow-[#6B1E2E]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingKey === `${purchase.productId}::${files[0].key}` ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Generating Link...</>
                      ) : (
                        <><Download className="w-4 h-4" />Download PDF</>
                      )}
                    </button>
                  ) : (
                    // Multiple files — list each
                    <div className="space-y-2">
                      <p className="text-xs text-mutedgray font-ui">{files.length} files included:</p>
                      {files.map((file, fi) => {
                        const dk = `${purchase.productId}::${file.key}`;
                        return (
                          <button
                            key={fi}
                            onClick={() => handleDownload(purchase, file.key, file.name)}
                            disabled={downloadingKey === dk}
                            className="w-full py-2 px-3 border border-burgundy/30 hover:bg-burgundy/5 text-burgundy rounded-xl font-ui text-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingKey === dk ? (
                              <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                            ) : (
                              <FileText className="w-3 h-3 flex-shrink-0" />
                            )}
                            <span className="truncate">{file.name}</span>
                            <Download className="w-3 h-3 ml-auto flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
