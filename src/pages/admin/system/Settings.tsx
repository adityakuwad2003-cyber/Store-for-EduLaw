import { useState, useEffect, useCallback } from 'react';
import { 
  Settings as SettingsIcon, Save,
  Globe, Mail, Shield, 
  MessageSquare, Share2, 
  AlertTriangle, Info, HardDrive, 
  UserCheck, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  doc, getDoc, updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface SystemSettings {
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  supportWhatsApp: string;
  socialLinks: {
    instagram: string;
    linkedin: string;
    twitter: string;
  };
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  logoUrl?: string;
  version: string;
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'system'>('general');

  // ── DATA FETCHING ──
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'system', 'settings'));
      if (snap.exists()) {
        setSettings(snap.data() as SystemSettings);
      } else {
        // Initial defaults
        const defaults: SystemSettings = {
          siteName: 'EduLaw',
          siteTagline: 'Excellence in Legal Education',
          supportEmail: 'support@edulaw.in',
          supportWhatsApp: '+91 99999 00000',
          socialLinks: { instagram: '', linkedin: '', twitter: '' },
          maintenanceMode: false,
          allowRegistrations: true,
          version: '2.4.0'
        };
        setSettings(defaults);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load system configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ── ACTIONS ──
  const handleSave = async () => {
    if (!settings) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'system', 'settings'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      toast.success('System settings synchronized');
    } catch (error) {
      toast.error('Failed to update system config');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-2xl shadow-gold/20">
            <SettingsIcon className="w-8 h-8 text-ink" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-parchment">System Settings</h1>
            <p className="text-sm text-parchment/40 font-ui tracking-wide">Configure global platform behavior, branding, and infrastructure</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-4 bg-gold text-ink font-ui font-black rounded-2xl shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Sync Config'}
        </button>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-2 p-2 bg-white/5 rounded-2xl w-fit">
        {[
          { id: 'general', label: 'General', icon: Globe },
          { id: 'social', label: 'Integrations', icon: Share2 },
          { id: 'system', label: 'Advanced', icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-gold text-ink shadow-lg shadow-gold/10' : 'text-parchment/40 hover:text-parchment hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── FORM ── */}
      <div className="bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
         {activeTab === 'general' && (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                   <label className="input-label">Platform Name</label>
                   <input 
                    type="text" 
                    value={settings.siteName}
                    onChange={e => setSettings(v => ({ ...v!, siteName: e.target.value }))}
                    className="admin-input" 
                   />
                 </div>
                 <div className="space-y-3">
                   <label className="input-label">Site Tagline</label>
                   <input 
                    type="text" 
                    value={settings.siteTagline}
                    onChange={e => setSettings(v => ({ ...v!, siteTagline: e.target.value }))}
                    className="admin-input" 
                   />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                 <div className="space-y-3">
                   <label className="input-label">Support Email</label>
                   <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/30" />
                      <input 
                        type="email"
                        value={settings.supportEmail}
                        onChange={e => setSettings(v => ({ ...v!, supportEmail: e.target.value }))}
                        className="admin-input pl-14" 
                      />
                   </div>
                 </div>
                 <div className="space-y-3">
                   <label className="input-label">WhatsApp Hotline</label>
                   <div className="relative">
                      <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/30" />
                      <input 
                        type="text"
                        value={settings.supportWhatsApp}
                        onChange={e => setSettings(v => ({ ...v!, supportWhatsApp: e.target.value }))}
                        className="admin-input pl-14" 
                      />
                   </div>
                 </div>
              </div>
           </motion.div>
         )}

         {activeTab === 'social' && (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {['instagram', 'linkedin', 'twitter'].map(platform => (
                  <div key={platform} className="space-y-3">
                     <label className="input-label capitalize">{platform} Handle</label>
                     <input 
                       type="text"
                       value={(settings.socialLinks as any)[platform]}
                       onChange={e => setSettings(v => ({ ...v!, socialLinks: { ...v!.socialLinks, [platform]: e.target.value } }))}
                       className="admin-input"
                       placeholder="@username"
                     />
                  </div>
                ))}
              </div>
              
              <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                 <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                 <p className="text-xs text-blue-400/80 leading-relaxed font-ui">
                    Social links are displayed in the website footer and within the student dashboard profile section. Ensure you provide full URLs for direct navigation.
                 </p>
              </div>
           </motion.div>
         )}

         {activeTab === 'system' && (
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
              <div className="space-y-6">
                {[
                  { id: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Display a "Coming Back Soon" screen and block platform access', icon: AlertTriangle, color: 'text-red-400' },
                  { id: 'allowRegistrations', label: 'New Student Signup', desc: 'Control whether new accounts can be created on the platform', icon: UserCheck, color: 'text-green-500' },
                ].map((toggle) => (
                  <div key={toggle.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${toggle.color}`}>
                           <toggle.icon className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-parchment font-bold text-lg">{toggle.label}</p>
                           <p className="text-[10px] text-parchment/40 uppercase tracking-widest mt-1">{toggle.desc}</p>
                        </div>
                     </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(settings as any)[toggle.id]}
                          onChange={e => setSettings(v => ({ ...v!, [toggle.id]: e.target.checked }))}
                          className="sr-only peer" 
                        />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold shadow-lg"></div>
                      </label>
                  </div>
                ))}
              </div>

              <div className="p-8 rounded-3xl bg-gold/5 border border-gold/10 flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                       <HardDrive className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-parchment font-bold text-sm uppercase tracking-widest">Platform Version</p>
                       <p className="text-xs text-gold font-mono font-bold">{settings.version}</p>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] text-parchment font-black uppercase tracking-widest transition-all">
                    <RefreshCw className="w-4 h-4" /> Check Updates
                 </button>
              </div>
           </motion.div>
         )}
      </div>

      <style>{`
        .admin-input {
          @apply w-full bg-white/2 border border-white/10 rounded-2xl px-6 py-5 text-sm text-parchment font-ui placeholder:text-parchment/20 focus:outline-none focus:border-gold auto-fill:bg-transparent transition-all;
        }
        .input-label {
          @apply block text-[10px] font-ui text-parchment/30 uppercase tracking-[0.2em] font-black mb-3 ml-2;
        }
      `}</style>
    </div>
  );
}
