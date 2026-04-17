import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Plus, X, Save,
  UserCheck, ShieldCheck,
  Mail, Key, Lock, BadgeCheck
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
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'editor' | 'support' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: any;
  createdAt: any;
}

const ROLES = [
  { id: 'super_admin', label: 'Super Admin', desc: 'Full system access & financial controls' },
  { id: 'editor', label: 'Content Editor', desc: 'Manage notes, blog, and products' },
  { id: 'support', label: 'Support Agent', desc: 'Manage tickets and student CRM' },
  { id: 'moderator', label: 'Moderator', desc: 'Manage community and comments' },
];

export default function AdminAccess() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Partial<AdminUser> | null>(null);

  // ── DATA FETCHING ──
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'admin_users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AdminUser[];
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load administrative team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // ── ACTIONS ──
  const handleSave = async (data: Partial<AdminUser>) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (data.id) {
        await updateDoc(doc(db, 'admin_users', data.id), payload);
        toast.success('Admin permissions updated');
      } else {
        await addDoc(collection(db, 'admin_users'), {
          ...payload,
          status: 'active',
          createdAt: serverTimestamp(),
        });
        toast.success(`${data.name} invited as ${data.role}`);
      }
      setIsEditorOpen(false);
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to save admin user');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'admin',
      label: 'Administrator',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
             <UserCheck className={`w-5 h-5 ${row.role === 'super_admin' ? 'text-gold' : 'text-slate-300'}`} />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Privileges',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.role === 'super_admin' && <ShieldCheck className="w-3.5 h-3.5 text-gold" />}
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
             {row.role.replace('_', ' ')}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status === 'active' ? 'published' : 'archived'} />
    },
    {
      key: 'lastLogin',
      label: 'Last Access',
      render: (row) => (
        <span className="text-[10px] text-slate-400 font-mono">
           {row.lastLogin?.toDate ? format(row.lastLogin.toDate(), 'MMM dd, HH:mm') : 'Never'}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (row) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setEditingAdmin(row); setIsEditorOpen(true); }}
          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-gold rounded-lg transition-all"
          aria-label="Manage access"
        >
          <Key className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gold/5 blur-[60px] rounded-full -ml-16 -mt-16" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-slate-900">Admin Access</h1>
            <p className="text-sm text-slate-500 font-ui tracking-wide">Manage internal team roles, permissions, and security protocols</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingAdmin({ role: 'editor', status: 'active' }); setIsEditorOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-ui font-bold rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all relative z-10"
          aria-label="Grant access"
        >
          <Plus className="w-5 h-5" /> Grant Access
        </button>
      </div>

      <DataTable
        columns={columns}
        data={admins}
        loading={loading}
        keyField="id"
        onRowClick={(row) => { setEditingAdmin(row); setIsEditorOpen(true); }}
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
              className="relative w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-screen"
            >
              <div className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-display text-xl text-slate-900">{editingAdmin?.id ? 'Adjust Privileges' : 'Invite Administrator'}</h2>
                  <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mt-1">Access Control List</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400" aria-label="Close editor">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(editingAdmin || {}); }}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
              >
                <div className="space-y-4">
                  <label htmlFor="admin-name" className="input-label">Full Name</label>
                  <input 
                    id="admin-name"
                    type="text" required
                    value={editingAdmin?.name || ''}
                    onChange={e => setEditingAdmin(v => ({ ...v, name: e.target.value }))}
                    className="admin-input" 
                    placeholder="e.g. Adv. Vikram Singh"
                  />
                </div>

                <div className="space-y-4">
                  <label htmlFor="admin-email" className="input-label">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      id="admin-email"
                      type="email" required
                      value={editingAdmin?.email || ''}
                      onChange={e => setEditingAdmin(v => ({ ...v, email: e.target.value }))}
                      className="admin-input pl-10" 
                      placeholder="vikram@edulaw.in"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="input-label">Security Role</label>
                  <div className="grid grid-cols-1 gap-3">
                    {ROLES.map(role => (
                      <button
                        key={role.id} type="button"
                        onClick={() => setEditingAdmin(v => ({ ...v, role: role.id as any }))}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                          editingAdmin?.role === role.id 
                            ? 'bg-gold/5 border-gold shadow-[0_0_20px_rgba(201,168,76,0.1)]' 
                            : 'bg-slate-50 border-slate-200 hover:border-gold/30'
                        }`}
                      >
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            editingAdmin?.role === role.id ? 'bg-gold text-white' : 'bg-slate-100 text-slate-400'
                         }`}>
                           <Lock className="w-4 h-4" />
                         </div>
                         <div>
                           <p className={`text-xs font-bold uppercase tracking-widest ${editingAdmin?.role === role.id ? 'text-gold' : 'text-slate-400'}`}>{role.label}</p>
                           <p className="text-[10px] text-slate-400 mt-0.5">{role.desc}</p>
                         </div>
                         {editingAdmin?.role === role.id && <BadgeCheck className="w-5 h-5 text-gold ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-900 font-bold">Account Integrity</p>
                        <p className="text-xs text-slate-400 mt-1">Suspended users cannot access the dashboard</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          id="admin-status-toggle"
                          type="checkbox" 
                          checked={editingAdmin?.status === 'active'}
                          onChange={e => setEditingAdmin(v => ({ ...v, status: e.target.checked ? 'active' : 'inactive' }))}
                          className="sr-only peer" 
                          aria-label="Toggle account status"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold transition-colors"></div>
                      </label>
                    </div>
                </div>
              </form>

              <div className="p-8 border-t border-slate-200 bg-white flex items-center justify-end gap-4 shadow-[0_-12px_40px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={() => setIsEditorOpen(false)} className="text-sm font-ui text-slate-400 hover:text-slate-900 font-bold">Cancel</button>
                <button 
                  type="button"
                  onClick={() => handleSave(editingAdmin || {})}
                  className="px-10 py-3.5 bg-slate-900 text-white font-ui font-black rounded-xl shadow-lg hover:bg-slate-800 active:scale-[1.02] flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Commit Permissions
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201, 168, 76, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
