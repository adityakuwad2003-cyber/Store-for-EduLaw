import { useState, useEffect, useCallback } from 'react';
import { 
  LifeBuoy, RefreshCw, X, MessageSquare,
  Send, Paperclip, Flag, Reply
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, 
  getDocs, doc, updateDoc, 
  addDoc, serverTimestamp, 
  limit, onSnapshot 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  createdAt: any;
}

interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: 'Billing' | 'Technical' | 'Content' | 'General';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  lastMessageAt: any;
  createdAt: any;
  updatedAt: any;
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ── DATA FETCHING ──
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'support_tickets'), orderBy('lastMessageAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ticket[];
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Real-time messages for selected ticket
  useEffect(() => {
    if (!selectedTicket) return;

    const q = query(
      collection(db, `support_tickets/${selectedTicket.id}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedTicket]);

  // ── ACTIONS ──
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const msgData = {
        text: replyText,
        senderId: 'admin', // Should be current admin UID
        senderName: 'EduLaw Support',
        isAdmin: true,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, `support_tickets/${selectedTicket.id}/messages`), msgData);
      await updateDoc(doc(db, 'support_tickets', selectedTicket.id), {
        lastMessageAt: serverTimestamp(),
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });

      setReplyText('');
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Ticket marked as ${newStatus}`);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const columns: Column<Ticket>[] = [
    {
      key: 'ticket',
      label: 'Issue / Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-2 h-10 rounded-full ${
            row.priority === 'urgent' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
            row.priority === 'high' ? 'bg-orange-500' :
            row.priority === 'medium' ? 'bg-gold' : 'bg-parchment/20'
          }`} />
          <div>
            <p className="font-bold text-parchment truncate max-w-[200px]">{row.subject}</p>
            <p className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">{row.userName} · {row.category}</p>
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Flag className={`w-3 h-3 ${
            row.priority === 'urgent' ? 'text-red-500' :
            row.priority === 'high' ? 'text-orange-500' :
            row.priority === 'medium' ? 'text-gold' : 'text-parchment/40'
          }`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-parchment/60">{row.priority}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status === 'open' ? 'draft' : row.status === 'resolved' ? 'published' : row.status} />
    },
    {
      key: 'lastActive',
      label: 'Last Response',
      sortable: true,
      render: (row) => (
        <span className="text-[10px] text-parchment/30 font-mono">
           {row.lastMessageAt?.toDate ? format(row.lastMessageAt.toDate(), 'MMM dd, HH:mm') : 'Recently'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedTicket(row); setIsChatOpen(true); }}
          className="p-2 hover:bg-gold/10 text-parchment/40 hover:text-gold rounded-lg transition-all"
        >
          <Reply className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <LifeBuoy className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Support Tickets</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Manage Student queries, billing disputes, and technical assistance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTickets}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-parchment/40 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Desk
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setSelectedTicket(row); setIsChatOpen(true); }}
      />

      {/* ── CHAT SLIDE-OVER ── */}
      <AnimatePresence>
        {isChatOpen && selectedTicket && (
          <div className="fixed inset-0 z-[120] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="absolute inset-0 bg-ink/70 backdrop-blur-md" 
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-[#0A0A0A] border-l border-white/10 shadow-2xl flex flex-col h-screen"
            >
              {/* Chat Header */}
              <div className="px-8 py-6 bg-ink border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedTicket.priority === 'urgent' ? 'bg-red-500 animate-pulse' : 'bg-gold'
                  }`} />
                  <div>
                    <h2 className="font-display text-lg text-parchment leading-tight truncate max-w-[300px]">{selectedTicket.subject}</h2>
                    <p className="text-[10px] text-parchment/40 uppercase tracking-widest font-bold mt-1">Ticket #{selectedTicket.id.slice(0, 8)} · {selectedTicket.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <select 
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gold font-bold uppercase outline-none"
                   >
                     <option value="open">Open</option>
                     <option value="in_progress">In Progress</option>
                     <option value="resolved">Resolved</option>
                     <option value="closed">Closed</option>
                   </select>
                   <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-parchment/40">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#0D0D0D]">
                 {messages.map((msg) => (
                   <div key={msg.id} className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl ${
                        msg.isAdmin 
                          ? 'bg-gold text-ink rounded-tr-none shadow-lg shadow-gold/10' 
                          : 'bg-white/5 border border-white/10 text-parchment rounded-tl-none'
                      }`}>
                        <p className="text-sm font-ui leading-relaxed">{msg.text}</p>
                      </div>
                      <span className="text-[8px] text-parchment/30 uppercase tracking-widest font-black mt-2 px-1">
                        {msg.isAdmin ? 'Support Agent' : msg.senderName} · {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm') : 'Sent'}
                      </span>
                   </div>
                 ))}
                 {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                      <MessageSquare className="w-16 h-16 mb-4" />
                      <p className="font-display text-xl">No Messages Yet</p>
                   </div>
                 )}
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-ink border-t border-white/10">
                <form onSubmit={handleReply} className="relative">
                  <textarea 
                    rows={1}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
                    placeholder="Type your professional response..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm text-parchment font-ui placeholder:text-parchment/20 focus:outline-none focus:border-gold/30 transition-all resize-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <button type="button" className="p-2 text-parchment/20 hover:text-parchment transition-all">
                       <Paperclip className="w-4 h-4" />
                     </button>
                     <button 
                        type="submit" 
                        disabled={!replyText.trim()}
                        className="p-3 bg-gold text-ink rounded-xl shadow-lg shadow-gold/20 disabled:opacity-30 hover:scale-105 transition-all"
                     >
                       <Send className="w-4 h-4 fill-ink" />
                     </button>
                  </div>
                </form>
                <div className="flex items-center gap-4 mt-4">
                  <p className="text-[10px] text-parchment/20 uppercase tracking-[0.2em] font-black">Pre-sets:</p>
                  <button onClick={() => setReplyText('Thank you for reaching out. We have received your query regarding billing and are looking into it.')} className="text-[9px] text-gold/40 hover:text-gold font-bold uppercase px-2 py-1 rounded bg-gold/5 border border-gold/10">Billing Fix</button>
                  <button onClick={() => setReplyText('The requested PDF notes have been manually assigned to your account. Please check your library.')} className="text-[9px] text-gold/40 hover:text-gold font-bold uppercase px-2 py-1 rounded bg-gold/5 border border-gold/10">Manual Access</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
