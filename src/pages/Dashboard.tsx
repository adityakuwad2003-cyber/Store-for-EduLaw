import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Download, LogOut, User, ArrowRight,
  ShoppingBag, Shield, Loader2, AlertCircle, Clock,
  FileText, Heart, ShoppingCart, Trash2, Receipt,
  Bookmark, Package, ChevronDown, ChevronUp, Search,
  CheckCircle2, X, Files,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getSecureDownloadUrl } from '@/lib/storage';
import { useCartStore, useWishlistStore } from '@/store';
import type { Note } from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────
const QUOTA_STORAGE_KEY = 'edulaw-download-quotas';
const MAX_DOWNLOADS = 5;

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Quota Helpers ────────────────────────────────────────────────────────────
function getQuotaMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function getQuotaKey(purchaseId: string, fileKey: string): string {
  return `quota_${purchaseId}_${fileKey}`;
}

function getDownloadCount(purchaseId: string, fileKey: string): number {
  return getQuotaMap()[getQuotaKey(purchaseId, fileKey)] ?? 0;
}

function incrementDownloadCount(purchaseId: string, fileKey: string): void {
  const map = getQuotaMap();
  const key = getQuotaKey(purchaseId, fileKey);
  map[key] = (map[key] ?? 0) + 1;
  localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(map));
}

function getTotalFileCount(purchases: Purchase[]): number {
  return purchases.reduce((sum, p) => {
    const files = p.fileKeys?.length > 0 ? p.fileKeys : p.fileKey ? [{ name: p.title, key: p.fileKey }] : [];
    return sum + files.length;
  }, 0);
}

// ─── Download Button ──────────────────────────────────────────────────────────
function DownloadBtn({
  purchase,
  file,
  loadingKey,
  onDownload,
  size = 'md',
}: {
  purchase: Purchase;
  file: FileEntry;
  loadingKey: string | null;
  onDownload: (p: Purchase, key: string, name: string) => void;
  size?: 'md' | 'sm';
}) {
  const dk = `${purchase.productId}::${file.key}`;
  const isLoading = loadingKey === dk;
  const count = getDownloadCount(purchase.id, file.key);
  const isExhausted = count >= MAX_DOWNLOADS;
  const isWarning = !isExhausted && count >= MAX_DOWNLOADS - 1;

  if (size === 'sm') {
    return (
      <button
        onClick={() => onDownload(purchase, file.key, file.name)}
        disabled={isLoading || isExhausted}
        title={isExhausted ? `Download limit reached (${MAX_DOWNLOADS}/${MAX_DOWNLOADS})` : file.name}
        className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-ui font-semibold transition-all group
          ${isExhausted
            ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200'
            : isWarning
              ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
              : 'bg-parchment border border-parchment-dark text-ink hover:bg-burgundy/5 hover:border-burgundy/30 hover:text-burgundy'
          }`}
      >
        {isLoading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          : <FileText className="w-3.5 h-3.5 shrink-0 text-burgundy/60 group-hover:text-burgundy" />
        }
        <span className="truncate flex-1 text-left">{file.name}</span>
        {isExhausted
          ? <span className="text-[9px] font-black text-red-400 uppercase shrink-0">Limit</span>
          : isWarning
            ? <span className="text-[9px] font-black text-amber-500 uppercase shrink-0">{count}/{MAX_DOWNLOADS}</span>
            : <Download className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
        }
      </button>
    );
  }

  return (
    <button
      onClick={() => onDownload(purchase, file.key, file.name)}
      disabled={isLoading || isExhausted}
      className={`w-full py-3 rounded-2xl font-ui font-bold text-sm transition-all flex items-center justify-center gap-2.5
        ${isExhausted
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : isWarning
            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200'
            : 'bg-burgundy text-parchment hover:bg-burgundy-light shadow-lg shadow-burgundy/20 active:scale-[0.98]'
        }`}
    >
      {isLoading ? (
        <><Loader2 className="w-4 h-4 animate-spin" />Generating secure link…</>
      ) : isExhausted ? (
        <>Download limit reached</>
      ) : isWarning ? (
        <><Download className="w-4 h-4" />Download PDF · {MAX_DOWNLOADS - count} left</>
      ) : (
        <><Download className="w-4 h-4" />Download PDF</>
      )}
    </button>
  );
}

// ─── Purchase Card ─────────────────────────────────────────────────────────────
function PurchaseCard({
  purchase,
  loadingKey,
  onDownload,
}: {
  purchase: Purchase;
  loadingKey: string | null;
  onDownload: (p: Purchase, key: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const files: FileEntry[] =
    purchase.fileKeys?.length > 0
      ? purchase.fileKeys
      : purchase.fileKey
      ? [{ name: purchase.title, key: purchase.fileKey }]
      : [];

  const isBundle = files.length > 1 || purchase.title.toLowerCase().includes('bundle') || purchase.title.toLowerCase().includes('combo');
  const hasFiles = files.length > 0;
  const PREVIEW_COUNT = 3;
  const visibleFiles = expanded ? files : files.slice(0, PREVIEW_COUNT);
  const hiddenCount = files.length - PREVIEW_COUNT;

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-burgundy/20 transition-all overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${isBundle ? 'bg-gradient-to-r from-gold to-amber-400' : 'bg-gradient-to-r from-burgundy to-burgundy-light'}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isBundle ? 'bg-gold/10' : 'bg-burgundy/8'}`}>
            {isBundle
              ? <Package className="w-5 h-5 text-gold" />
              : <BookOpen className="w-5 h-5 text-burgundy" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-ui font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isBundle ? 'bg-gold/10 text-amber-700' : 'bg-burgundy/8 text-burgundy'}`}>
                {isBundle ? 'Bundle' : 'Note'}
              </span>
              {hasFiles && (
                <span className="text-[9px] font-ui font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                  <Files className="w-2.5 h-2.5" />{files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
              )}
            </div>
            <h3 className="font-ui font-bold text-ink text-sm leading-snug line-clamp-2">{purchase.title}</h3>
            <p className="text-[11px] text-mutedgray mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />{formatDate(purchase.purchasedAt)}
              <span className="mx-1 text-parchment-dark">·</span>
              <span className="font-display text-gold font-bold">₹{purchase.price}</span>
            </p>
          </div>
        </div>

        {/* Files section */}
        {!hasFiles ? (
          <div className="flex items-center gap-2 py-3 px-4 bg-slate-50 rounded-xl text-sm text-slate-400 font-ui">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Files being prepared — check back shortly
          </div>
        ) : files.length === 1 ? (
          <DownloadBtn purchase={purchase} file={files[0]} loadingKey={loadingKey} onDownload={onDownload} size="md" />
        ) : (
          <div className="space-y-2">
            <div className="space-y-1.5">
              {visibleFiles.map((file, i) => (
                <DownloadBtn key={i} purchase={purchase} file={file} loadingKey={loadingKey} onDownload={onDownload} size="sm" />
              ))}
            </div>

            {files.length > PREVIEW_COUNT && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-ui font-bold text-burgundy/70 hover:text-burgundy transition-colors"
              >
                {expanded ? (
                  <><ChevronUp className="w-3.5 h-3.5" />Show less</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" />+{hiddenCount} more {hiddenCount === 1 ? 'file' : 'files'}</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function Dashboard() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { items: wishlistItems, remove: removeFromWishlist } = useWishlistStore();
  const { addNote } = useCartStore();

  // Show success banner when arriving from checkout
  useEffect(() => {
    if (location.state?.fromCheckout) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 6000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchPurchases = async () => {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/purchases', {
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

  const handleDownload = useCallback(async (
    purchase: Purchase,
    fileKey: string,
    fileName: string,
  ) => {
    if (!currentUser) return;
    if (!fileKey) { toast.error('Download link not configured for this file yet.'); return; }

    const currentCount = getDownloadCount(purchase.id, fileKey);
    if (currentCount >= MAX_DOWNLOADS) {
      toast.error('Download limit reached (5/5). Contact support to reset.');
      return;
    }

    const trackingKey = `${purchase.productId}::${fileKey}`;
    setDownloadingKey(trackingKey);
    try {
      const token = await currentUser.getIdToken();
      const url = await getSecureDownloadUrl(fileKey, purchase.productId, token);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.pdf`;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      incrementDownloadCount(purchase.id, fileKey);
      toast.success(`Downloading "${fileName}"…`);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error(err.message || 'Could not generate download link. Please try again.');
    } finally {
      setDownloadingKey(null);
    }
  }, [currentUser]);

  const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalFiles = useMemo(() => getTotalFileCount(purchases), [purchases]);

  const sortedPurchases = useMemo(() =>
    [...purchases].sort((a, b) => {
      const da = a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0;
      const db = b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0;
      return db - da;
    }),
    [purchases]
  );

  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedPurchases;
    return sortedPurchases.filter(p => p.title.toLowerCase().includes(q));
  }, [sortedPurchases, search]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
      {/* ── Header ── */}
      <div className="bg-ink py-10">
        <div className="section-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-gold" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-burgundy to-burgundy-light flex items-center justify-center border-2 border-gold">
                  <User className="w-6 h-6 text-parchment" />
                </div>
              )}
              <div>
                <h1 className="font-display text-xl text-parchment">{currentUser.displayName || 'My Library'}</h1>
                <p className="text-parchment/50 text-xs">{currentUser.email}</p>
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

        {/* ── Purchase success banner ── */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1">
                <p className="font-ui font-bold text-emerald-800 text-sm">Purchase successful!</p>
                <p className="text-xs text-emerald-600">Your files are ready to download below.</p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="text-emerald-400 hover:text-emerald-600">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-burgundy/8 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-burgundy" />
            </div>
            <div>
              <p className="font-display text-2xl text-ink leading-none">{purchases.length}</p>
              <p className="text-xs text-mutedgray mt-0.5">Documents</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
              <Files className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="font-display text-2xl text-ink leading-none">{totalFiles}</p>
              <p className="text-xs text-mutedgray mt-0.5">PDF Files</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-display text-2xl text-ink leading-none">₹{totalSpent}</p>
              <p className="text-xs text-mutedgray mt-0.5">Total Invested</p>
            </div>
          </div>
        </div>

        {/* ── My Library ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h2 className="font-display text-2xl text-ink">My Library</h2>
          {purchases.length > 3 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedgray" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search your library…"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-ui text-sm placeholder:text-slate-300 focus:outline-none focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/10"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-slate-100">
                <div className="h-1 w-full bg-parchment-dark rounded-full mb-4" />
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-parchment-dark rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-parchment-dark rounded w-3/4" />
                    <div className="h-3 bg-parchment-dark rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-parchment-dark rounded-xl" />
              </div>
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-parchment rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-mutedgray" />
            </div>
            <h3 className="font-display text-xl text-ink mb-2">Your library is empty</h3>
            <p className="text-mutedgray text-sm mb-6 max-w-xs mx-auto">
              Browse our marketplace and purchase notes to start building your legal library.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-burgundy text-parchment rounded-xl font-ui font-medium hover:bg-burgundy-light transition-colors"
            >
              Browse Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Search className="w-10 h-10 text-parchment-dark mx-auto mb-3" />
            <p className="font-ui text-sm text-mutedgray">No results for "{search}"</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPurchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <PurchaseCard
                  purchase={purchase}
                  loadingKey={downloadingKey}
                  onDownload={handleDownload}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Purchase History ── */}
        <div className="mt-12">
          <h2 className="font-display text-2xl text-ink mb-5 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-burgundy" />
            Purchase History
          </h2>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse flex gap-4">
                  <div className="h-4 bg-parchment-dark rounded w-24" />
                  <div className="h-4 bg-parchment-dark rounded flex-1" />
                  <div className="h-4 bg-parchment-dark rounded w-16" />
                </div>
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl text-mutedgray border border-slate-100">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-ui text-sm">No purchases yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 px-5 py-3 bg-parchment/60 border-b border-slate-100 text-[10px] font-ui font-black text-mutedgray uppercase tracking-widest">
                <span className="col-span-2">Date</span>
                <span className="col-span-5">Product</span>
                <span className="col-span-2">Amount</span>
                <span className="col-span-3">Payment ID</span>
              </div>
              <div className="divide-y divide-slate-50">
                {sortedPurchases.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="grid sm:grid-cols-12 gap-1 sm:gap-0 px-5 py-3.5 hover:bg-parchment/30 transition-colors"
                  >
                    <div className="sm:col-span-2 flex items-center">
                      <span className="text-xs text-mutedgray font-ui">{formatDate(p.purchasedAt)}</span>
                    </div>
                    <div className="sm:col-span-5 flex items-center">
                      <p className="text-sm font-ui font-medium text-ink line-clamp-1">{p.title}</p>
                    </div>
                    <div className="sm:col-span-2 flex items-center">
                      <span className="font-display text-burgundy text-sm font-bold">₹{p.price}</span>
                    </div>
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <span className="text-[11px] text-mutedgray font-mono truncate">
                        {p.razorpay_payment_id?.slice(-10) || '—'}
                      </span>
                      <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-ui font-black bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                        Paid
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Total row */}
              <div className="px-5 py-3 bg-parchment/40 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-ui text-mutedgray">{purchases.length} purchase{purchases.length !== 1 ? 's' : ''}</span>
                <span className="font-display text-ink font-bold">Total: ₹{totalSpent}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Saved for Later ── */}
        <div className="mt-12 mb-8">
          <h2 className="font-display text-2xl text-ink mb-5 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-burgundy" />
            Saved for Later
          </h2>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <Heart className="w-10 h-10 text-parchment-dark mx-auto mb-3" />
              <p className="font-ui text-sm text-mutedgray mb-4">Nothing saved yet.</p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1.5 text-sm text-burgundy font-ui font-bold hover:underline"
              >
                Browse Marketplace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlistItems.map((note: Note, idx: number) => (
                <motion.div
                  key={String(note.id)}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-xl p-4 border border-slate-100 hover:border-burgundy/20 transition-all flex flex-col gap-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-ui font-semibold text-ink text-sm leading-tight line-clamp-2">{note.title}</p>
                      {note.category && (
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-parchment rounded-full text-mutedgray font-ui">
                          {note.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-display text-burgundy text-sm font-bold">₹{note.price}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { addNote(note); toast.success(`"${note.title}" added to cart.`); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-burgundy text-parchment rounded-lg font-ui text-xs font-bold hover:bg-burgundy-light transition-colors"
                      >
                        <ShoppingCart className="w-3 h-3" /> Cart
                      </button>
                      <button
                        onClick={() => { removeFromWishlist(String(note.id)); toast.success('Removed from wishlist.'); }}
                        className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Lifetime access note ── */}
        <div className="flex items-center gap-3 p-4 bg-white/60 border border-slate-100 rounded-2xl">
          <Shield className="w-5 h-5 text-gold shrink-0" />
          <p className="text-xs font-ui text-mutedgray">
            All purchased documents are yours to keep. <span className="font-bold text-ink">Lifetime access</span> — re-download anytime within your per-file limit. Need a reset? Contact support.
          </p>
        </div>

      </div>
    </div>
  );
}
