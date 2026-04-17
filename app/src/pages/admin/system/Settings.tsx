import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon, Save,
  Globe, Mail, Shield,
  MessageSquare, Share2,
  AlertTriangle, Info, HardDrive,
  UserCheck, RefreshCw, Send,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';

interface SocialLinks {
  instagram: string;
  telegram: string;
  twitter: string;
}

interface SystemSettings {
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  supportWhatsApp: string;
  socialLinks: SocialLinks;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  version: string;
}

const DEFAULTS: SystemSettings = {
  siteName: 'The EduLaw',
  siteTagline: "India's Premium Legal Notes Shop",
  supportEmail: 'support@theedulaw.in',
  supportWhatsApp: '+91 98765 43210',
  socialLinks: { instagram: 'https://instagram.com/theedulaw', telegram: 'https://t.me/theedulaw', twitter: '' },
  maintenanceMode: false,
  allowRegistrations: true,
  version: '2.0.0',
};

async function getToken(currentUser: any): Promise<string> {
  return currentUser?.getIdToken?.() ?? '';
}

export default function Settings() {
  const { currentUser } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULTS);
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'system'>('general');

  // ── FETCH ────────────────────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken(currentUser);
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setSettings({ ...DEFAULTS, ...data.settings });
    } catch (err: any) {
      toast.error(err.message || 'Could not load system settings');
      // Keep defaults so the page is never blank
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── SAVE ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken(currentUser);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      toast.success('System settings saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 font-ui placeholder:text-slate-300 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all';
  const labelCls = 'block text-[10px] font-ui text-slate-400 uppercase tracking-[0.2em] font-black mb-2 ml-1';

  const tabs = [
    { id: 'general', label: 'General',      icon: Globe   },
    { id: 'social',  label: 'Integrations', icon: Share2  },
    { id: 'system',  label: 'Advanced',     icon: Shield  },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-[#b8922a] flex items-center justify-center shadow-lg shadow-gold/20 shrink-0">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-slate-900">System Settings</h1>
            <p className="text-xs text-slate-500 font-ui tracking-wide mt-0.5">Configure global platform behavior, branding and contact details</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-ink font-ui font-black rounded-2xl shadow-md shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed relative z-10 w-fit"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── LOADING SKELETON ─────────────────────────────────────────────── */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 animate-pulse shadow-sm">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-14 bg-slate-50 rounded-2xl" />
          ))}
        </div>
      )}

      {/* ── FORM PANELS ──────────────────────────────────────────────────── */}
      {!loading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">

          {/* GENERAL */}
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="platform-name" className={labelCls}>Platform Name</label>
                  <input
                    id="platform-name"
                    type="text"
                    value={settings.siteName}
                    onChange={e => setSettings(v => ({ ...v, siteName: e.target.value }))}
                    className={inputCls}
                    placeholder="The EduLaw"
                  />
                </div>
                <div>
                  <label className={labelCls}>Site Tagline</label>
                  <input
                    type="text"
                    value={settings.siteTagline}
                    onChange={e => setSettings(v => ({ ...v, siteTagline: e.target.value }))}
                    className={inputCls}
                    placeholder="India's Premium Legal Notes Shop"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="support-email" className={labelCls}>Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    <input
                      id="support-email"
                      type="email"
                      value={settings.supportEmail}
                      onChange={e => setSettings(v => ({ ...v, supportEmail: e.target.value }))}
                      className={`${inputCls} pl-11`}
                      placeholder="support@theedulaw.in"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>WhatsApp Hotline</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.supportWhatsApp}
                      onChange={e => setSettings(v => ({ ...v, supportWhatsApp: e.target.value }))}
                      className={`${inputCls} pl-11`}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INTEGRATIONS / SOCIAL */}
          {activeTab === 'social' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Instagram */}
                <div>
                  <label htmlFor="instagram-url" className={labelCls}>Instagram URL</label>
                  <input
                    id="instagram-url"
                    type="url"
                    value={settings.socialLinks.instagram}
                    onChange={e => setSettings(v => ({ ...v, socialLinks: { ...v.socialLinks, instagram: e.target.value } }))}
                    className={inputCls}
                    placeholder="https://instagram.com/theedulaw"
                  />
                </div>
                {/* Telegram */}
                <div>
                  <label htmlFor="telegram-url" className={labelCls}>Telegram URL</label>
                  <div className="relative">
                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    <input
                      id="telegram-url"
                      type="url"
                      value={settings.socialLinks.telegram}
                      onChange={e => setSettings(v => ({ ...v, socialLinks: { ...v.socialLinks, telegram: e.target.value } }))}
                      className={`${inputCls} pl-11`}
                      placeholder="https://t.me/theedulaw"
                    />
                  </div>
                </div>
                {/* Twitter/X */}
                <div>
                  <label htmlFor="twitter-url" className={labelCls}>Twitter / X URL</label>
                  <input
                    id="twitter-url"
                    type="url"
                    value={settings.socialLinks.twitter}
                    onChange={e => setSettings(v => ({ ...v, socialLinks: { ...v.socialLinks, twitter: e.target.value } }))}
                    className={inputCls}
                    placeholder="https://twitter.com/theedulaw"
                  />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gold/5 border border-gold/10 flex items-start gap-3">
                <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed font-ui">
                  These URLs are used in the website footer and student dashboard. Enter full URLs (starting with https://) for all active channels.
                </p>
              </div>
            </motion.div>
          )}

          {/* ADVANCED / SYSTEM */}
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Toggle rows */}
              {[
                {
                  id: 'maintenanceMode',
                  label: 'Maintenance Mode',
                  desc: 'Show a "Coming Back Soon" screen and block all platform access',
                  icon: AlertTriangle,
                  color: 'text-red-500',
                  bg: 'bg-red-50 border-red-100',
                },
                {
                  id: 'allowRegistrations',
                  label: 'New Student Signups',
                  desc: 'Allow new accounts to be created on the platform',
                  icon: UserCheck,
                  color: 'text-green-500',
                  bg: 'bg-green-50 border-green-100',
                },
              ].map((toggle) => (
                <div key={toggle.id} className={`flex items-center justify-between p-5 rounded-2xl border ${toggle.bg}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center ${toggle.color} shrink-0`}>
                      <toggle.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-sm">{toggle.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-ui">{toggle.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={(settings as any)[toggle.id]}
                      onChange={e => setSettings(v => ({ ...v, [toggle.id]: e.target.checked }))}
                      className="sr-only peer"
                      aria-label={`Toggle ${toggle.label}`}
                    />
                    <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-gold transition-colors after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-6" />
                  </label>
                </div>
              ))}

              {/* Version row */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                    <HardDrive className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-sm uppercase tracking-wider">Platform Version</p>
                    <p className="text-xs text-gold font-mono font-bold mt-0.5">{settings.version}</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="platform-version" className={labelCls}>Version Tag</label>
                  <input
                    id="platform-version"
                    type="text"
                    value={settings.version}
                    onChange={e => setSettings(v => ({ ...v, version: e.target.value }))}
                    className="w-28 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-gold/50 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
