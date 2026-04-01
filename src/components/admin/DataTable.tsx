import { useState } from "react";
import { 
  Search, ChevronLeft, ChevronRight, 
  Filter,
  CheckSquare, Square, Loader2,
  ChevronUp, ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyField: keyof T;
  
  // Pagination
  totalCount?: number;
  rowsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  
  // Selection
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  
  // Search & Filter
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  
  // Actions
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns, 
  data, 
  loading = false, 
  keyField,
  totalCount,
  rowsPerPage = 20,
  currentPage = 1,
  onPageChange,
  selectedIds = [],
  onSelectionChange,
  onSearch,
  searchPlaceholder = "Search records...",
  onRowClick,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState("");

  // Handle Select All
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(item => String((item as any)[keyField])));
    }
  };

  // Handle Single Select
  const handleSelectOne = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const isServerSide = !!totalCount && !!onPageChange;
  const totalPages = isServerSide 
    ? Math.ceil(totalCount / rowsPerPage) 
    : Math.ceil(data.length / rowsPerPage);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-1">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/30" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-parchment placeholder:text-parchment/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3">
          {onSelectionChange && selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-lg border border-gold/20"
            >
              <span className="text-xs font-ui font-bold text-gold uppercase tracking-widest">
                {selectedIds.length} Selected
              </span>
            </motion.div>
          )}
          {/* Slot for extra buttons if needed */}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="relative group/table bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10">
                {onSelectionChange && (
                  <th className="w-12 px-4 py-4 text-center">
                    <button 
                      onClick={handleSelectAll}
                      className="text-parchment/30 hover:text-gold transition-colors"
                    >
                      {selectedIds.length === data.length && data.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-gold" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-4 text-[10px] font-ui font-bold text-parchment/40 uppercase tracking-widest whitespace-nowrap select-none ${
                      col.sortable ? "cursor-pointer hover:text-parchment transition-colors" : ""
                    } ${col.className || ""}`}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && (
                        <div className="flex flex-col opacity-0 group-hover/table:opacity-100 transition-opacity">
                          <ChevronUp className="w-2.5 h-2.5 -mb-1" />
                          <ChevronDown className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {onSelectionChange && <td className="p-4 bg-white/5 border-r border-white/5" />}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-6">
                        <div className="h-2 bg-white/10 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Filter className="w-6 h-6 text-parchment/20" />
                      </div>
                      <p className="text-parchment/40 font-ui text-sm">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const id = String((row as any)[keyField]);
                  const isSelected = selectedIds.includes(id);
                  return (
                    <tr
                      key={id}
                      onClick={() => onRowClick?.(row)}
                      className={`group transition-all duration-200 border-l-2 ${
                        isSelected 
                          ? 'bg-gold/5 border-gold shadow-inner' 
                          : 'border-transparent hover:bg-white/[0.03] hover:border-white/10'
                      } ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {onSelectionChange && (
                        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleSelectOne(id)}
                            className={`transition-colors ${isSelected ? 'text-gold' : 'text-parchment/20 group-hover:text-parchment/40'}`}
                          >
                            {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </button>
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className={`px-4 py-4 text-sm font-ui text-parchment/80 ${col.className || ""}`}>
                          {col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Overlay for loading */}
        {loading && data.length > 0 && (
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-300">
            <div className="bg-ink/80 border border-gold/20 p-4 rounded-2xl flex items-center gap-3 shadow-2xl">
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
              <span className="text-gold font-ui text-xs font-bold uppercase tracking-widest">Updating Dashboard...</span>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {(isServerSide || totalPages > 1) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
          <div className="text-xs font-ui text-parchment/40 uppercase tracking-widest font-bold">
            Showing <span className="text-parchment/80">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-parchment/80">{Math.min(currentPage * rowsPerPage, totalCount || data.length)}</span> of <span className="text-gold">{totalCount || data.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="p-2 rounded-xl border border-white/10 text-parchment/40 hover:text-gold hover:border-gold/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1">
              {/* Simple page indicator - can be expanded to full numbers if needed */}
              <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-gold font-bold text-xs ring-2 ring-gold/5">
                {currentPage}
              </div>
            </div>
            <button
              disabled={currentPage >= totalPages || loading}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="p-2 rounded-xl border border-white/10 text-parchment/40 hover:text-gold hover:border-gold/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
