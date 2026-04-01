import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, X, Save,
  Layers, Trash2,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, 
  getDocs, doc, updateDoc, 
  addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  imageUrl?: string;
  hint?: string;
}

interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  category: string;
  cards: Flashcard[];
  status: 'published' | 'draft';
  activeStudents: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  createdAt: any;
  updatedAt: any;
}

export default function FlashcardsManager() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Partial<FlashcardDeck> | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'cards'>('info');

  // ── DATA FETCHING ──
  const fetchDecks = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'flashcard_decks'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FlashcardDeck[];
      setDecks(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
      toast.error('Failed to load flashcard library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<FlashcardDeck>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        activeStudents: data.activeStudents || 0
      };

      if (data.id) {
        await updateDoc(doc(db, 'flashcard_decks', data.id), payload);
        toast.success('Deck updated successfully');
      } else {
        await addDoc(collection(db, 'flashcard_decks'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('New flashcard deck created');
      }
      setIsEditorOpen(false);
      fetchDecks();
    } catch (error) {
      toast.error('Failed to save flashcard deck');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<FlashcardDeck>[] = [
    {
      key: 'title',
      label: 'Deck Details',
      render: (row) => (
        <div>
          <p className="font-bold text-parchment">{row.title}</p>
          <p className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">{row.subject} · {row.difficulty}</p>
        </div>
      )
    },
    {
      key: 'cards',
      label: 'Volume',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-parchment/60">
          <Layers className="w-4 h-4 text-gold/60" />
          {row.cards?.length || 0} Cards
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'usage',
      label: 'Retention',
      render: (row) => (
        <div className="flex items-center gap-2">
           <Brain className="w-3.5 h-3.5 text-parchment/30" />
           <span className="text-xs font-mono text-parchment/60">{row.activeStudents || 0} Learners</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setEditingDeck(row); setIsEditorOpen(true); }}
          className="p-2 hover:bg-gold/10 text-parchment/40 hover:text-gold rounded-lg transition-all"
        >
          <Edit className="w-4 h-4" />
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
            <Layers className="w-7 h-7 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-parchment">Flashcards Manager</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Manage legal terminology decks and mnemonic study aids</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingDeck({ cards: [], status: 'draft', difficulty: 'Beginner' }); setIsEditorOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-ink font-ui font-bold rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" /> New Study Deck
        </button>
      </div>

      <DataTable
        columns={columns}
        data={decks}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingDeck(row); setIsEditorOpen(true); }}
      />

      {/* ── EDITOR SLIDE-OVER ── */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md" 
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-ink border-l border-white/10 shadow-2xl flex flex-col h-screen"
            >
              <div className="px-8 py-6 bg-ink border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl text-parchment">{editingDeck?.id ? 'Edit Study Deck' : 'New Knowledge Set'}</h2>
                    <div className="flex gap-4 mt-3">
                      {['info', 'cards'].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab as any)}
                          className={`text-[10px] uppercase font-black tracking-[0.2em] transition-all ${
                            activeTab === tab ? 'text-gold border-b border-gold pb-1' : 'text-parchment/30 hover:text-parchment/60'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-parchment/40">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingDeck || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
              >
                {activeTab === 'info' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-4">
                      <label className="input-label">Deck Title</label>
                      <input 
                        type="text" required
                        value={editingDeck?.title || ''}
                        onChange={e => setEditingDeck(v => ({ ...v, title: e.target.value }))}
                        className="admin-input font-bold" 
                        placeholder="e.g. Important Latin Maxims"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="input-label">Subject</label>
                        <input 
                          type="text" required
                          value={editingDeck?.subject || ''}
                          onChange={e => setEditingDeck(v => ({ ...v, subject: e.target.value }))}
                          className="admin-input" 
                          placeholder="Evidence Law"
                        />
                      </div>
                      <div>
                        <label className="input-label">Difficulty</label>
                        <select 
                          value={editingDeck?.difficulty}
                          onChange={e => setEditingDeck(v => ({ ...v, difficulty: e.target.value as any }))}
                          className="admin-input font-bold"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Expert">Expert / Judiciary</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="input-label">Status</label>
                      <select 
                        value={editingDeck?.status}
                        onChange={e => setEditingDeck(v => ({ ...v, status: e.target.value as any }))}
                        className="admin-input"
                      >
                         <option value="draft">Internal Draft</option>
                         <option value="published">Publicly Visible</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'cards' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                     <div className="flex items-center justify-between">
                        <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Memory Cards ({editingDeck?.cards?.length || 0})</h3>
                        <button 
                          type="button"
                          onClick={() => {
                            const newCard: Flashcard = { id: `card-${Date.now()}`, front: '', back: '' };
                            setEditingDeck(v => ({ ...v, cards: [...(v?.cards || []), newCard] }));
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-xs text-gold font-bold hover:bg-gold hover:text-ink transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add Card
                        </button>
                     </div>

                     <div className="space-y-4">
                        {editingDeck?.cards?.map((card, idx) => (
                           <div key={card.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono text-parchment/20 uppercase tracking-widest">Card ID: #{idx + 1}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setEditingDeck(v => ({ ...v, cards: v?.cards?.filter(c => c.id !== card.id) }))}
                                  className="text-parchment/20 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <label className="text-[8px] text-parchment/40 uppercase font-black tracking-widest mb-1 block">Front (Question)</label>
                                   <textarea 
                                     value={card.front}
                                     onChange={e => {
                                        const newCards = [...(editingDeck?.cards || [])];
                                        newCards[idx].front = e.target.value;
                                        setEditingDeck(v => ({ ...v, cards: newCards }));
                                     }}
                                     className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-parchment outline-none min-h-[60px] resize-none"
                                   />
                                </div>
                                <div>
                                   <label className="text-[8px] text-parchment/40 uppercase font-black tracking-widest mb-1 block">Back (Answer)</label>
                                   <textarea 
                                     value={card.back}
                                     onChange={e => {
                                        const newCards = [...(editingDeck?.cards || [])];
                                        newCards[idx].back = e.target.value;
                                        setEditingDeck(v => ({ ...v, cards: newCards }));
                                     }}
                                     className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-parchment outline-none min-h-[60px] resize-none"
                                   />
                                </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </form>

              <div className="p-8 border-t border-white/10 flex items-center justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-parchment/40 hover:text-parchment">Discard</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingDeck || {})}
                  className="px-10 py-3.5 bg-gold text-ink font-ui font-black rounded-xl shadow-xl shadow-gold/10 hover:scale-[1.02] flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Confirm Deck
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          @apply w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-parchment font-ui placeholder:text-parchment/20 focus:outline-none focus:border-gold/50 transition-all;
        }
        .input-label {
          @apply block text-[10px] font-ui text-parchment/40 uppercase tracking-widest font-black mb-2 ml-1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
