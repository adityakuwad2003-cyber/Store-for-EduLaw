import { useState, useEffect, useCallback } from "react";
import { auth } from "../../../lib/firebase";
import { db } from "../../../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { DataTable } from "../../../components/admin/DataTable";
import { StatusBadge } from "../../../components/admin/StatusBadge";
import { ConfirmModal } from "../../../components/admin/ConfirmModal";
import { Package, RefreshCw, AlertCircle } from "lucide-react";

interface Bundle {
  id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category?: string;
  isActive?: boolean;
  noteIds?: string[];
  createdAt?: string;
}

export default function BundlesManager() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bundle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "bundles"), orderBy("title"));
      const snap = await getDocs(q);
      const data: Bundle[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Bundle, "id">),
      }));
      setBundles(data);
    } catch (err: any) {
      setError(err.message || "Failed to load bundles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBundles(); }, [fetchBundles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/delete-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noteId: deleteTarget.id, deleteBundle: true }),
      });
      if (!res.ok) throw new Error("Failed to delete bundle");
      setBundles((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "title", label: "Bundle Name", sortable: true,
      render: (b: Bundle) => (
        <span className="font-semibold text-slate-800">{b.title}</span>
      ),
    },
    {
      key: "noteIds", label: "Notes Included",
      render: (b: Bundle) => (
        <span className="inline-flex items-center gap-1 text-slate-600">
          {(b.noteIds?.length ?? 0)} notes
        </span>
      ),
    },
    {
      key: "price", label: "Bundle Price", sortable: true,
      render: (b: Bundle) => (
        <div>
          <span className="font-bold text-slate-800">₹{b.price}</span>
          {b.originalPrice && b.originalPrice > b.price && (
            <span className="ml-2 text-xs text-slate-400 line-through">₹{b.originalPrice}</span>
          )}
        </div>
      ),
    },
    {
      key: "isActive", label: "Status",
      render: (b: Bundle) => (
        <StatusBadge status={b.isActive !== false ? "active" : "inactive"} />
      ),
    },
    {
      key: "id", label: "Actions",
      render: (b: Bundle) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(b); }}
          className="text-xs px-2.5 py-1 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#7b2d42]" /> Bundles Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "Loading..." : `${bundles.length} bundle${bundles.length !== 1 ? "s" : ""} in catalog`}
          </p>
        </div>
        <button
          onClick={fetchBundles}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={bundles}
        loading={loading}
        keyField="id"
        searchPlaceholder="Search bundles..."
        emptyMessage="No bundles found. Use 'Migrate Catalog' in Notes Manager to import your existing bundles."
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Bundle"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Bundle"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
