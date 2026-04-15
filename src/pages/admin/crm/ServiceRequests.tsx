import { useState, useEffect } from 'react';
import { 
  FileText, Check, Loader2, Phone, Mail, IndianRupee, Clock, User
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  pricingType: string;
  status: 'new' | 'in_progress' | 'completed';
  amountPaid: number;
  paymentId: string | null;
  isPaid: boolean;
  customer: {
    userId: string | null;
    name: string;
    email: string;
    phone: string;
    description: string;
  };
  createdAt: any;
}

const COLUMNS = [
  { id: 'new', title: 'New Leads', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'in_progress', title: 'In Progress / Quoted', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'completed', title: 'Completed', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
] as const;

export function ServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'service_requests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
      setRequests(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: ServiceRequest['status']) => {
    e.preventDefault();
    if (!draggingId) return;

    const request = requests.find(r => r.id === draggingId);
    if (!request || request.status === status) return;

    try {
      // Optimistic update
      setRequests(prev => prev.map(r => r.id === draggingId ? { ...r, status } : r));
      
      // Update DB
      await updateDoc(doc(db, 'service_requests', draggingId), {
        status,
        updatedAt: new Date()
      });
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
      // Revert optimistic update will happen on next snapshot
    } finally {
      setDraggingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink font-bold">Service Tracker (CRM)</h1>
          <p className="font-ui text-sm text-slate-500">Manage incoming leads and legal service orders.</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)] gap-6 overflow-x-auto pb-4">
        {COLUMNS.map(column => {
          const colRequests = requests.filter(r => r.status === column.id);
          
          return (
            <div 
              key={column.id}
              className={`flex-1 min-w-[320px] max-w-[400px] flex flex-col ${column.bgColor} border ${column.borderColor} rounded-2xl overflow-hidden`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as any)}
            >
              <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white/50">
                <h3 className="font-ui font-black uppercase tracking-widest text-xs text-slate-700">{column.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white border border-slate-200 shadow-sm">{colRequests.length}</span>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {colRequests.map(req => (
                  <div
                    key={req.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, req.id)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> {req.serviceName}
                      </div>

                      {req.pricingType === 'instant' ? (
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border ${
                          req.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {req.isPaid ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {req.isPaid ? 'Paid' : 'Unpaid'}
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-violet-50 text-violet-600 border border-violet-200">
                          Lead / Quote
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="font-display font-bold text-ink mb-1 flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400" />{req.customer.name}</p>
                      <div className="font-ui text-xs text-slate-500 space-y-1 mt-2">
                        <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {req.customer.email}</p>
                        <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {req.customer.phone}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="font-ui text-[11px] text-slate-600 leading-relaxed italic">"{req.customer.description}"</p>
                    </div>

                    {req.isPaid && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-ui">
                        <span className="text-slate-400 font-medium">Revenue</span>
                        <span className="font-black text-gold flex items-center"><IndianRupee className="w-3 h-3"/> {req.amountPaid}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {colRequests.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-50 text-xs font-ui font-bold uppercase tracking-widest text-slate-400 pb-10">
                    Drop Here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
