type Status =
  | "completed" | "paid" | "active" | "published"
  | "failed" | "refunded" | "pending"
  | "draft" | "inactive" | "archived"
  | string;

const STATUS_STYLES: Record<Status, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  active:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  published:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed:     "bg-red-50 text-red-600 border-red-200",
  refunded:   "bg-orange-50 text-orange-600 border-orange-200",
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  draft:      "bg-slate-100 text-slate-600 border-slate-200",
  inactive:   "bg-slate-100 text-slate-500 border-slate-200",
  archived:   "bg-slate-100 text-slate-400 border-slate-200",
};

export function StatusBadge({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] || "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles}`}>
      {status}
    </span>
  );
}
