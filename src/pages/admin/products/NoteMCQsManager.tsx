import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen, Search, Plus, Edit, Trash2, Save,
  X, RefreshCw, CheckCircle, HelpCircle, ChevronRight,
  AlertTriangle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  question: string;
  options: string[]; // exactly 4
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface NoteInfo {
  id: string;
  title: string;
  category: string;
}

interface McqSummary {
  noteId: string;
  noteTitle: string;
  questionCount: number;
}

const DIFFICULTY_LABELS: Record<Question['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const DIFFICULTY_COLORS: Record<Question['difficulty'], string> = {
  easy: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  hard: 'bg-red-50 text-red-600 border-red-200',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function newQuestion(): Question {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
    difficulty: 'medium',
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface QuestionEditorProps {
  question: Question;
  onSave: (q: Question) => void;
  onClose: () => void;
}

function QuestionEditor({ question, onSave, onClose }: QuestionEditorProps) {
  const [draft, setDraft] = useState<Question>({ ...question, options: [...question.options] });

  function handleOptionChange(idx: number, value: string) {
    setDraft(prev => {
      const options = [...prev.options];
      options[idx] = value;
      return { ...prev, options };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.question.trim()) {
      toast.error('Question text is required');
      return;
    }
    if (draft.options.some(o => !o.trim())) {
      toast.error('All four options must be filled in');
      return;
    }
    onSave(draft);
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col z-[110]"
    >
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-slate-900">
            {question.id && question.question ? 'Edit Question' : 'New Question'}
          </h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">MCQ Editor</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
          aria-label="Close editor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-7 custom-scrollbar">
        {/* Question text */}
        <div>
          <label className="input-label">Question</label>
          <textarea
            value={draft.question}
            onChange={e => setDraft(prev => ({ ...prev, question: e.target.value }))}
            className="admin-input min-h-[100px] resize-none"
            placeholder="Type the question here..."
            required
          />
        </div>

        {/* Options */}
        <div>
          <label className="input-label">Options — select the correct answer</label>
          <div className="space-y-3">
            {draft.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {/* Radio for correct answer */}
                <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name="correctIndex"
                    checked={draft.correctIndex === idx}
                    onChange={() => setDraft(prev => ({ ...prev, correctIndex: idx }))}
                    className="w-4 h-4 accent-[#C9A84C] cursor-pointer"
                    aria-label={`Mark option ${OPTION_LABELS[idx]} as correct`}
                  />
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border transition-all ${
                      draft.correctIndex === idx
                        ? 'bg-[#C9A84C] text-white border-[#C9A84C]'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    {OPTION_LABELS[idx]}
                  </span>
                </label>
                <input
                  type="text"
                  value={opt}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-ui placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
                  placeholder={`Option ${OPTION_LABELS[idx]}`}
                  required
                />
              </div>
            ))}
          </div>
          {draft.correctIndex >= 0 && (
            <p className="mt-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Option {OPTION_LABELS[draft.correctIndex]} is marked correct
            </p>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label className="input-label">Difficulty</label>
          <div className="flex gap-3">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDraft(prev => ({ ...prev, difficulty: d }))}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                  draft.difficulty === d
                    ? DIFFICULTY_COLORS[d] + ' shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="input-label">Explanation (shown after answer)</label>
          <textarea
            value={draft.explanation}
            onChange={e => setDraft(prev => ({ ...prev, explanation: e.target.value }))}
            className="admin-input min-h-[90px] resize-none"
            placeholder="Explain why the correct answer is right, cite sections or case law if relevant..."
          />
        </div>
      </form>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-slate-200 bg-white flex items-center justify-end gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)] shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-ui text-slate-400 hover:text-slate-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (!draft.question.trim()) { toast.error('Question text is required'); return; }
            if (draft.options.some(o => !o.trim())) { toast.error('All four options must be filled in'); return; }
            onSave(draft);
          }}
          className="px-8 py-3 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Question
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function NoteMCQsManager() {
  const { currentUser } = useAuth();

  // Data state
  const [notes, setNotes] = useState<NoteInfo[]>([]);
  const [mcqSummaries, setMcqSummaries] = useState<McqSummary[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // UI state
  const [notesLoading, setNotesLoading] = useState(true);
  const [mcqsLoading, setMcqsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Editor state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Ref to track if a note selection is in progress (prevent double-click races)
  const loadingNoteRef = useRef<string | null>(null);

  // ── Auth helper ────────────────────────────────────────────────────────────

  async function getToken(): Promise<string> {
    if (!currentUser) throw new Error('Not authenticated');
    return currentUser.getIdToken();
  }

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/list-data?type=notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data = await res.json();
      // list-data returns array directly or wrapped; handle both shapes
      const raw: any[] = Array.isArray(data) ? data : (data.notes ?? data.items ?? []);
      setNotes(
        raw.map((n: any) => ({ id: n.id, title: n.title ?? n.name ?? '', category: n.category ?? '' }))
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notes list');
    } finally {
      setNotesLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchMcqSummaries = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/list-mcqs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch MCQ list');
      const data = await res.json();
      setMcqSummaries(data.mcqs ?? []);
    } catch (err) {
      console.error(err);
      // Non-fatal: summaries are cosmetic
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchNoteMcqs = useCallback(async (note: NoteInfo) => {
    if (loadingNoteRef.current === note.id) return;
    loadingNoteRef.current = note.id;
    setMcqsLoading(true);
    setQuestions([]);
    setIsDirty(false);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/get-mcqs?noteId=${encodeURIComponent(note.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch MCQs');
      const data = await res.json();
      setQuestions(data.questions ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load MCQs for this note');
      setQuestions([]);
    } finally {
      setMcqsLoading(false);
      loadingNoteRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchNotes(), fetchMcqSummaries()]);
    if (selectedNote) await fetchNoteMcqs(selectedNote);
  }, [fetchNotes, fetchMcqSummaries, fetchNoteMcqs, selectedNote]);

  useEffect(() => {
    fetchNotes();
    fetchMcqSummaries();
  }, [fetchNotes, fetchMcqSummaries]);

  // ── Note selection ─────────────────────────────────────────────────────────

  function handleSelectNote(note: NoteInfo) {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Discard them and switch note?')) return;
    }
    setSelectedNote(note);
    setIsEditorOpen(false);
    setEditingQuestion(null);
    fetchNoteMcqs(note);
  }

  // ── Question CRUD (local) ──────────────────────────────────────────────────

  function handleAddQuestion() {
    setEditingQuestion(newQuestion());
    setIsEditorOpen(true);
  }

  function handleEditQuestion(q: Question) {
    setEditingQuestion({ ...q, options: [...q.options] });
    setIsEditorOpen(true);
  }

  function handleSaveQuestion(q: Question) {
    setQuestions(prev => {
      const idx = prev.findIndex(p => p.id === q.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = q;
        return updated;
      }
      return [...prev, q];
    });
    setIsDirty(true);
    setIsEditorOpen(false);
    setEditingQuestion(null);
    toast.success('Question saved locally — click "Save All" to persist');
  }

  function handleDeleteQuestion(id: string) {
    if (!window.confirm('Remove this question? The change will apply when you Save All.')) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
    setIsDirty(true);
  }

  // ── Save all to server ─────────────────────────────────────────────────────

  async function handleSaveAll() {
    if (!selectedNote) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/save-mcqs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: selectedNote.id,
          noteTitle: selectedNote.title,
          questions,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Save failed');
      }
      toast.success(`Saved ${questions.length} questions for "${selectedNote.title}"`);
      setIsDirty(false);
      // Refresh summaries so the count badge updates
      fetchMcqSummaries();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? 'Failed to save MCQs');
    } finally {
      setSaving(false);
    }
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const summaryMap = Object.fromEntries(mcqSummaries.map(s => [s.noteId, s.questionCount]));

  const filteredNotes = notes
    .filter(n =>
      !search.trim() ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Notes with MCQs first
      const aHas = summaryMap[a.id] != null ? 1 : 0;
      const bHas = summaryMap[b.id] != null ? 1 : 0;
      if (bHas !== aHas) return bHas - aHas;
      return a.title.localeCompare(b.title);
    });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#b8922a] flex items-center justify-center shadow-lg shadow-[#C9A84C]/20">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Note MCQs Manager</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">
              Attach MCQ question sets to notes for self-assessment
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={notesLoading || mcqsLoading}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#C9A84C] hover:shadow-sm rounded-xl transition-all shadow-sm self-start md:self-auto"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${(notesLoading || mcqsLoading) ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-5 min-h-0 flex-1" style={{ minHeight: '600px' }}>

        {/* ── LEFT PANEL ── */}
        <div className="w-80 shrink-0 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 font-ui placeholder:text-slate-300 focus:outline-none focus:border-[#C9A84C]/50 transition-all"
              />
            </div>
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notesLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-[#C9A84C] animate-spin" />
                <p className="text-xs text-slate-400 font-ui">Loading notes...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                <BookOpen className="w-8 h-8 text-slate-200" />
                <p className="text-sm text-slate-400 font-ui">
                  {search ? 'No notes match your search' : 'No notes found'}
                </p>
              </div>
            ) : (
              <ul className="p-2 space-y-1">
                {filteredNotes.map(note => {
                  const count = summaryMap[note.id];
                  const isSelected = selectedNote?.id === note.id;
                  const hasMcqs = count != null && count > 0;
                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectNote(note)}
                        className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all group flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#C9A84C]/8 border border-[#C9A84C]/40 shadow-sm'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-ui truncate ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                            {note.title}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                            {note.category}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          {hasMcqs ? (
                            <span className="text-[10px] font-black bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {count}Q
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-ui whitespace-nowrap">No MCQs</span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#C9A84C] translate-x-0.5' : 'text-slate-200 group-hover:text-slate-400'}`} />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer count */}
          <div className="px-5 py-3 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-ui uppercase tracking-widest">
              {notes.length} notes · {mcqSummaries.length} with MCQs
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden min-w-0">
          {!selectedNote ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-slate-300" />
              </div>
              <div>
                <p className="font-display text-lg text-slate-600">Select a note</p>
                <p className="text-sm text-slate-400 font-ui mt-1 max-w-xs">
                  Choose a note from the left panel to view and manage its MCQ question set.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Right panel header */}
              <div className="px-7 py-5 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-xl text-slate-900 truncate">{selectedNote.title}</h2>
                    {isDirty && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                        <AlertTriangle className="w-3 h-3" />
                        Unsaved
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-ui uppercase tracking-widest">
                    {selectedNote.category} · {questions.length} Question{questions.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    disabled={mcqsLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/30 hover:text-[#C9A84C] rounded-xl text-sm font-ui font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={saving || mcqsLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save All
                  </button>
                </div>
              </div>

              {/* Questions list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {mcqsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-6 h-6 text-[#C9A84C] animate-spin" />
                    <p className="text-sm text-slate-400 font-ui">Loading questions...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-display text-base text-slate-600">No questions yet</p>
                      <p className="text-sm text-slate-400 font-ui mt-1">
                        Click "Add Question" to build this note's MCQ set.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] rounded-xl text-sm font-ui font-bold hover:bg-[#C9A84C] hover:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {questions.map((q, idx) => (
                        <motion.div
                          key={q.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.18 }}
                          className="group p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Number + question */}
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <span className="shrink-0 w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-ui text-slate-800 leading-relaxed line-clamp-2">
                                  {q.question || <span className="text-slate-300 italic">No question text</span>}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {/* Difficulty badge */}
                                  <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty]}`}>
                                    {DIFFICULTY_LABELS[q.difficulty]}
                                  </span>
                                  {/* Correct answer label */}
                                  <span className="text-[10px] text-slate-400 font-ui">
                                    Correct: <span className="font-black text-emerald-600">Option {OPTION_LABELS[q.correctIndex] ?? '?'}</span>
                                    {q.options[q.correctIndex] ? ` — ${q.options[q.correctIndex]}` : ''}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEditQuestion(q)}
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] hover:border-[#C9A84C]/30 rounded-lg transition-all shadow-sm"
                                aria-label={`Edit question ${idx + 1}`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-2 bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-lg transition-all shadow-sm"
                                aria-label={`Delete question ${idx + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add more button at bottom */}
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full py-3.5 rounded-2xl border border-dashed border-slate-200 text-slate-400 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all text-sm font-ui flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Question
                    </button>
                  </div>
                )}
              </div>

              {/* Save footer (shown only when dirty) */}
              <AnimatePresence>
                {isDirty && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className="px-7 py-4 border-t border-amber-100 bg-amber-50 flex items-center justify-between shrink-0"
                  >
                    <p className="text-xs text-amber-700 font-ui flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      You have unsaved changes. Click "Save All" to persist them.
                    </p>
                    <button
                      type="button"
                      onClick={handleSaveAll}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-sm font-ui font-black rounded-xl shadow hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save All
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* ── Question Editor slide-over ── */}
      <AnimatePresence>
        {isEditorOpen && editingQuestion && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[105]"
              onClick={() => { setIsEditorOpen(false); setEditingQuestion(null); }}
            />
            <QuestionEditor
              question={editingQuestion}
              onSave={handleSaveQuestion}
              onClose={() => { setIsEditorOpen(false); setEditingQuestion(null); }}
            />
          </>
        )}
      </AnimatePresence>

      <style>{`
        .admin-input {
          width: 100%;
          background: rgb(248 250 252);
          border: 1px solid rgb(226 232 240);
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          font-family: var(--font-ui, sans-serif);
          transition: border-color 0.15s;
        }
        .admin-input::placeholder { color: rgb(203 213 225); }
        .admin-input:focus { outline: none; border-color: rgba(201, 168, 76, 0.5); }
        .input-label {
          display: block;
          font-size: 10px;
          font-family: var(--font-ui, sans-serif);
          color: rgb(148 163 184);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 900;
          margin-bottom: 0.5rem;
          margin-left: 0.25rem;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
