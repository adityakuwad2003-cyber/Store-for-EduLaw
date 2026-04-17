import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, 
  ClipboardCheck, X, Save, Trash2,
  Clock, HelpCircle, FileUp, Archive,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  collection, query, orderBy, 
  getDocs, doc, updateDoc, 
  addDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DataTable } from '../../../components/admin/DataTable';
import type { Column } from '../../../components/admin/DataTable';
import { StatusBadge } from '../../../components/admin/StatusBadge';
import Papa from 'papaparse';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface MockTest {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  totalMarks: number;
  passMarks: number;
  price: number;
  isFree: boolean;
  status: 'published' | 'draft' | 'scheduled';
  startDateTime?: string;
  endDateTime?: string;
  questions: Question[];
  stats: {
    attempts: number;
    avgScore: number;
    passRate: number;
  };
  createdAt: any;
  updatedAt: any;
}

export default function MockTestsManager() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Partial<MockTest> | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'questions' | 'analytics'>('info');

  // ── DATA FETCHING ──
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'mock_tests'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MockTest[];
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load mock tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<MockTest>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        totalMarks: data.questions?.length || 0,
        stats: data.stats || { attempts: 0, avgScore: 0, passRate: 0 }
      };

      if (data.id) {
        await updateDoc(doc(db, 'mock_tests', data.id), payload);
        toast.success('Test updated successfully');
      } else {
        await addDoc(collection(db, 'mock_tests'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success('Test created successfully');
      }
      // Auto-ping Google to pick up the new/updated mock test in sitemap
      fetch('/api/purchases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ping-google' }) }).catch(() => null);
      setIsEditorOpen(false);
      fetchTests();
    } catch (error) {
      toast.error('Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMockTest = async (testId: string) => {
    if (!window.confirm('Are you sure you want to delete this mock test completely? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'mock_tests', testId));
      toast.success('Mock test deleted successfully');
      fetchTests();
    } catch (error) {
      toast.error('Failed to delete mock test');
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedQuestions: Question[] = results.data.map((row: any, i) => ({
          id: `q-${Date.now()}-${i}`,
          questionText: row.question,
          options: [row.option1, row.option2, row.option3, row.option4],
          correctAnswer: parseInt(row.correct_index),
          explanation: row.explanation
        }));
        
        setEditingTest(prev => ({
          ...prev,
          questions: [...(prev?.questions || []), ...importedQuestions]
        }));
        toast.success(`Imported ${importedQuestions.length} questions`);
      }
    });
  };

  const columns: Column<MockTest>[] = [
    {
      key: 'title',
      label: 'Test Details',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{row.subject} · {row.duration} Mins</p>
        </div>
      )
    },
    {
      key: 'questions',
      label: 'Questions',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <HelpCircle className="w-4 h-4" />
          {row.questions?.length || 0} Items
        </div>
      )
    },
    {
      key: 'price',
      label: 'Access',
      render: (row) => (
        <span className={row.isFree ? "text-green-500 font-bold text-xs" : "text-gold font-bold text-xs"}>
          {row.isFree ? 'FREE' : `₹${row.price}`}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'performance',
      label: 'Avg. Score',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold transition-all duration-500 progress-bar-fill" 
              style={{ '--progress': `${(row.stats?.avgScore || 0) / (row.totalMarks || 1) * 100}%` } as React.CSSProperties} 
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400">{(row.stats?.avgScore || 0).toFixed(1)} pts</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setEditingTest(row); setIsEditorOpen(true); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-gold/10 hover:text-gold hover:border-gold/30 rounded-lg transition-all shadow-sm"
            aria-label="Edit mock test"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteMockTest(row.id as string); }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-lg transition-all shadow-sm"
            title="Delete mock test completely"
            aria-label="Delete mock test completely"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <ClipboardCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Mock Tests Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Build interactive law exams and track student performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTests}
            disabled={loading}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-gold hover:shadow-sm rounded-xl transition-all shadow-sm"
            aria-label="Refresh tests"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setEditingTest({ questions: [], duration: 60, status: 'draft', isFree: false }); setIsEditorOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" /> Create New Test
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tests}
        loading={loading}
        keyField="id"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => { setEditingTest(row); setIsEditorOpen(true); }}
      />

      {/* ── EDITOR SLIDE-OVER ── */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-3xl bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            >
              <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-display text-xl text-slate-900">{editingTest?.id ? 'Edit Mock Test' : 'New Exam Suite'}</h2>
                  <div className="flex gap-4 mt-3">
                    {['info', 'questions', 'analytics'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab as any)}
                        className={`text-[10px] uppercase font-black tracking-[0.2em] transition-all ${
                          activeTab === tab ? 'text-gold border-b border-gold pb-1' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400" aria-label="Close editor">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingTest || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-10 pb-32 custom-scrollbar"
              >
                {activeTab === 'info' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-4">
                      <label className="input-label">Test Title</label>
                      <input 
                        type="text" required
                        value={editingTest?.title || ''}
                        onChange={e => setEditingTest(v => ({ ...v, title: e.target.value }))}
                        className="admin-input" 
                        placeholder="e.g. Haryana Judiciary Prelims Mock - II"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="input-label">Subject</label>
                        <input 
                          type="text" required
                          value={editingTest?.subject || ''}
                          onChange={e => setEditingTest(v => ({ ...v, subject: e.target.value }))}
                          className="admin-input" 
                          placeholder="Constitutional Law"
                        />
                      </div>
                      <div>
                        <label className="input-label">Duration (Minutes)</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            id="test-duration"
                            type="number" required
                            value={editingTest?.duration || ''}
                            onChange={e => setEditingTest(v => ({ ...v, duration: Number(e.target.value) }))}
                            className="admin-input pl-10" 
                            aria-label="Test Duration in Minutes"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-slate-900 font-ui text-[10px] uppercase tracking-[0.2em] font-black">Monetization & Status</h3>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editingTest?.isFree}
                              onChange={e => setEditingTest(v => ({ ...v, isFree: e.target.checked }))}
                              className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-gold focus:ring-gold"
                            />
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Free Test</span>
                          </label>
                        </div>
                      </div>
                      
                      {!editingTest?.isFree && (
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                            <label htmlFor="test-price" className="input-label">Price (₹)</label>
                            <input 
                              id="test-price"
                              type="number" 
                              value={editingTest?.price || ''}
                              onChange={e => setEditingTest(v => ({ ...v, price: Number(e.target.value) }))}
                              className="admin-input border-gold/20 bg-white" 
                              aria-label="Test Price"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="test-status" className="input-label">Publishing Status</label>
                        <select 
                          id="test-status"
                          value={editingTest?.status}
                          onChange={e => setEditingTest(v => ({ ...v, status: e.target.value as any }))}
                          className="admin-input"
                          aria-label="Test Status"
                        >
                          <option value="draft">Draft (Private)</option>
                          <option value="published">Published (Live)</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'questions' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-gold font-ui text-[10px] uppercase tracking-[0.2em] font-black">Question Bank ({editingTest?.questions?.length || 0})</h3>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 hover:text-gold cursor-pointer transition-all">
                          <FileUp className="w-4 h-4" />
                          Import CSV
                          <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
                        </label>
                        <button 
                          type="button"
                          onClick={() => {
                            const newQ: Question = {
                              id: `q-${Date.now()}`,
                              questionText: '',
                              options: ['', '', '', ''],
                              correctAnswer: 0
                            };
                            setEditingTest(v => ({ ...v, questions: [...(v?.questions || []), newQ] }));
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-xs text-gold font-bold hover:bg-gold hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add Question
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {editingTest?.questions?.map((q, idx) => (
                        <div key={q.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-mono text-gold/60"># {idx + 1}</span>
                            <button 
                              type="button" 
                              onClick={() => setEditingTest(v => ({ ...v, questions: v?.questions?.filter(item => item.id !== q.id) }))}
                              className="text-slate-300 hover:text-red-500"
                              aria-label="Delete question"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea 
                            value={q.questionText}
                            onChange={e => {
                                const newQs = [...(editingTest?.questions || [])];
                                newQs[idx].questionText = e.target.value;
                                setEditingTest(v => ({ ...v, questions: newQs }));
                            }}
                            className="admin-input min-h-[80px] bg-white" 
                            placeholder="Type question text here..."
                          />
                          <div className="grid grid-cols-2 gap-4">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-3">
                                <input 
                                  type="radio" 
                                  name={`correct-${q.id}`} 
                                  checked={q.correctAnswer === optIdx}
                                  onChange={() => {
                                    const newQs = [...(editingTest?.questions || [])];
                                    newQs[idx].correctAnswer = optIdx;
                                    setEditingTest(v => ({ ...v, questions: newQs }));
                                  }}
                                  className="text-gold focus:ring-gold bg-transparent border-slate-300"
                                  aria-label={`Option ${optIdx + 1} is correct`}
                                />
                                <input 
                                  type="text" 
                                  value={opt}
                                  onChange={e => {
                                      const newQs = [...(editingTest?.questions || [])];
                                      newQs[idx].options[optIdx] = e.target.value;
                                      setEditingTest(v => ({ ...v, questions: newQs }));
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:border-gold/30 outline-none"
                                  placeholder={`Option ${optIdx + 1}`}
                                  aria-label={`Option ${optIdx + 1} text`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-slate-200 flex items-center justify-end gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-slate-400 hover:text-slate-900">Discard</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingTest || {})}
                  className="px-10 py-3.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[1.02] flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save Test Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          @apply w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 font-ui placeholder:text-slate-300 focus:outline-none focus:border-gold/50 transition-all;
        }
        .input-label {
          @apply block text-[10px] font-ui text-slate-400 uppercase tracking-widest font-black mb-2 ml-1;
        }
        .bar-anim { animation-delay: var(--delay); }
        .progress-bar-fill { width: var(--progress); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
