import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Search, Scale, ExternalLink, RefreshCw, Info, ChevronDown,
  AlertCircle, Gavel, Building2, FileText, Quote,
  Copy, Check, Newspaper, Sparkles, Library, Shield, GraduationCap,
  ArrowRight, Award, Zap, Briefcase, Users, ChevronRight,
  Lock, Crown, Star, LogIn,
} from 'lucide-react';
import { DIGEST_POOL } from '../data/playground/judgmentDigests';
import { QUIZ_POOL } from '../data/playground/quizData';
import { getJudgesForAct, matchJudgeProfiles, type JudgeProfile } from '../data/judgeProfiles';
import { getBridgeMappings, BRIDGE_ACT_IDS, ACT_NEW_LABEL } from '../data/actMappings';
import type { JudgmentResult, NewsResult, LawyerResult } from '../../api/judgment-search';
import { useAuth } from '../contexts/AuthContext';
import { checkCanSearch, recordSearch } from '../hooks/useJudgmentUsage';
import type { UsageInfo, UsageReason } from '../hooks/useJudgmentUsage';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAJOR_ACTS = [
  { id: 'ipc',   name: 'Indian Penal Code (IPC) 1860',           sections: 511 },
  { id: 'bns',   name: 'Bharatiya Nyaya Sanhita (BNS) 2023',     sections: 358 },
  { id: 'crpc',  name: 'CrPC 1973 (Code of Criminal Procedure)', sections: 528 },
  { id: 'bnss',  name: 'BNSS 2023 (Bharatiya Nagarik Suraksha)', sections: 531 },
  { id: 'cpc',   name: 'Code of Civil Procedure (CPC) 1908',     sections: 158 },
  { id: 'iea',   name: 'Indian Evidence Act 1872',                sections: 167 },
  { id: 'bsa',   name: 'Bharatiya Sakshya Adhiniyam (BSA) 2023', sections: 170 },
  { id: 'ca',    name: 'Companies Act 2013',                      sections: 470 },
  { id: 'const', name: 'Constitution of India (Articles)',        sections: 395 },
];

type SearchMode   = 'section' | 'keyword' | 'citation';
type CourtFilter  = 'all' | 'sc' | 'hc' | 'tribunal';
type SearchStatus = 'idle' | 'searching' | 'results' | 'error';

const COURT_LABELS: Record<CourtFilter, string> = {
  all: 'All Courts', sc: 'Supreme Court', hc: 'High Courts', tribunal: 'Tribunals',
};

const LAWYER_TYPE: Record<string, string> = {
  ipc: 'Criminal Lawyer', bns: 'Criminal Lawyer', crpc: 'Criminal Lawyer',
  bnss: 'Criminal Lawyer', iea: 'Criminal Lawyer', bsa: 'Criminal Lawyer',
  cpc: 'Civil Lawyer', ca: 'Corporate Lawyer', const: 'Constitutional Lawyer',
};

const EXAM_FREQ: Record<string, { label: string; color: string; exams: string }> = {
  ipc:   { label: 'Very High', color: 'bg-red-500/20 text-red-300',       exams: 'UPSC J · HJS · APO · Munsiff' },
  bns:   { label: 'High',      color: 'bg-orange-500/20 text-orange-300', exams: 'UPSC J · HJS · APO' },
  crpc:  { label: 'Very High', color: 'bg-red-500/20 text-red-300',       exams: 'UPSC J · APO · HJS' },
  bnss:  { label: 'Emerging',  color: 'bg-yellow-500/20 text-yellow-300', exams: 'UPSC J (from 2025)' },
  const: { label: 'Critical',  color: 'bg-purple-500/20 text-purple-300', exams: 'UPSC CSE · UPSC J · HJS' },
  iea:   { label: 'High',      color: 'bg-orange-500/20 text-orange-300', exams: 'UPSC J · HJS' },
  bsa:   { label: 'Emerging',  color: 'bg-yellow-500/20 text-yellow-300', exams: 'UPSC J (from 2025)' },
  cpc:   { label: 'High',      color: 'bg-orange-500/20 text-orange-300', exams: 'Munsiff · Civil Judge · HJS' },
  ca:    { label: 'Medium',    color: 'bg-blue-500/20 text-blue-300',     exams: 'Company Secretary · NCLT Bar' },
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function getCourtBadgeCfg(court: string) {
  const t = court.toLowerCase();
  if (t.includes('supreme'))  return { label: 'SC',   cls: 'bg-burgundy/10 text-burgundy',  icon: <Scale     className="w-2.5 h-2.5" /> };
  if (t.includes('high'))     return { label: 'HC',   cls: 'bg-teal-100 text-teal-700',     icon: <Gavel     className="w-2.5 h-2.5" /> };
  if (t.includes('tribunal')) return { label: 'Trib', cls: 'bg-purple-100 text-purple-700', icon: <Building2 className="w-2.5 h-2.5" /> };
  return { label: 'Court', cls: 'bg-ink/8 text-ink/60', icon: <Gavel className="w-2.5 h-2.5" /> };
}

function getBenchStrength(text: string): { label: string; cls: string } | null {
  const t = text.toLowerCase();
  if (/constitution\s*bench|\b(13|11|9|7)\s*[- ]?judge/i.test(t))
    return { label: 'Constitution Bench', cls: 'bg-purple-100 text-purple-700' };
  if (/division\s*bench|\b[53]\s*[- ]?judge/i.test(t))
    return { label: 'Division Bench', cls: 'bg-blue-100 text-blue-700' };
  return null;
}

function findMatchingQuiz(actId: string, query: string) {
  const sectionNum = query.replace(/\D/g, '');
  const actKeywords: Record<string, string[]> = {
    ipc:   ['ipc', 'indian penal', ...(sectionNum ? [`section ${sectionNum} ipc`] : [])],
    bns:   ['bns', 'bharatiya nyaya', ...(sectionNum ? [`section ${sectionNum} bns`] : [])],
    crpc:  ['crpc', 'criminal procedure', ...(sectionNum ? [`section ${sectionNum} crpc`] : [])],
    bnss:  ['bnss', 'nagarik suraksha'],
    iea:   ['evidence act', ...(sectionNum ? [`section ${sectionNum} iea`] : [])],
    bsa:   ['sakshya', 'bsa'],
    cpc:   ['cpc', 'civil procedure', ...(sectionNum ? [`section ${sectionNum} cpc`] : [])],
    const: ['constitution', ...(sectionNum ? [`article ${sectionNum}`] : [])],
    ca:    ['companies act', 'ibc', 'insolvency'],
  };
  const keywords = actKeywords[actId] ?? [];
  return QUIZ_POOL.find(q => {
    const txt = (q.q + ' ' + q.explanation).toLowerCase();
    return keywords.some(k => txt.includes(k));
  }) ?? null;
}

function relatedDigests(actId: string) {
  const MAP: Record<string, string[]> = {
    ipc: ['Criminal Law', 'Criminal Procedure'], bns: ['Criminal Law', 'Criminal Procedure'],
    crpc: ['Criminal Procedure', 'Criminal Law'], bnss: ['Criminal Procedure', 'Criminal Law'],
    cpc: ['Property Law', 'Commercial Law'], iea: ['Evidence Law'], bsa: ['Evidence Law'],
    ca: ['Commercial Law'], const: ['Constitutional Law', 'Fundamental Rights', 'Administrative Law'],
  };
  const subjects = MAP[actId] ?? [];
  return DIGEST_POOL.filter(d => subjects.some(s => d.subject.includes(s))).slice(0, 3);
}

// ─── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({
  icon, number, title,
  audience,
  collapsible, collapsed, onToggle,
}: {
  icon: React.ReactNode; number: string; title: string;
  audience?: { label: string; chip: string };
  collapsible?: boolean; collapsed?: boolean; onToggle?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 mb-4 ${collapsible ? 'cursor-pointer select-none' : ''}`}
      onClick={collapsible ? onToggle : undefined}
    >
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/8 border border-gold/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gold font-ui whitespace-nowrap">
        {icon} § {number} &nbsp;{title}
      </span>
      {audience && (
        <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${audience.chip}`}>
          {audience.label}
        </span>
      )}
      <div className="flex-1 h-px bg-gold/10" />
      {collapsible && (
        <ChevronDown className={`w-4 h-4 text-ink/30 transition-transform shrink-0 ${collapsed ? '' : 'rotate-180'}`} />
      )}
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ }
      }}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider font-ui transition-all ${
        copied ? 'bg-green-100 text-green-700' : 'bg-parchment border border-ink/10 text-ink/50 hover:text-burgundy hover:border-burgundy/30'
      }`}
    >
      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

function CourtBadge({ court }: { court: string }) {
  const cfg = getCourtBadgeCfg(court);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────
function ReportSkeleton() {
  return (
    <div className="border-t border-ink/8 bg-[#FAFAF8] overflow-hidden">
      <div className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-gold font-ui">Scanning Court Records</span>
          {[0, 150, 300].map(d => (
            <span key={d} className="w-1 h-1 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
        <div className="h-16 rounded-2xl bg-ink/5 animate-shimmer" />
        {[12, 24, 16, 32, 20].map((h, i) => (
          <div key={i} className={`h-${h} rounded-xl bg-ink/5 animate-shimmer`} style={{ height: `${h * 4}px` }} />
        ))}
      </div>
    </div>
  );
}

// ─── § 1 Know the Law ─────────────────────────────────────────────────────────
function KnowTheLaw({ text }: { text: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section>
      <SectionLabel
        icon={<GraduationCap className="w-3 h-3" />} number="1" title="Know the Law"
        audience={{ label: 'For Everyone', chip: 'bg-teal-100 text-teal-700' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
          <div className="border-l-2 border-teal-400 pl-4">
            <p className="font-body text-sm text-ink/80 leading-relaxed">{text}</p>
          </div>
          <p className="mt-3 text-[10px] font-ui text-teal-600/70 font-black uppercase tracking-wider">Plain Language · Verified by EduLaw</p>
        </div>
      )}
    </section>
  );
}

// ─── § 2 Know Your Rights ────────────────────────────────────────────────────
function KnowYourRights({ rights }: { rights: string[] }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section>
      <SectionLabel
        icon={<Shield className="w-3 h-3" />} number="2" title="Know Your Rights"
        audience={{ label: 'For Citizens', chip: 'bg-burgundy/10 text-burgundy' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rights.map((right, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-burgundy/15 rounded-xl p-4 flex items-start gap-3"
            >
              <div className="shrink-0 w-7 h-7 rounded-full bg-burgundy/10 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-burgundy" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-burgundy/50 font-ui mb-0.5">Right {i + 1}</p>
                <p className="font-ui font-bold text-sm text-ink leading-snug">{right}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── § 3 Judicial Intelligence ───────────────────────────────────────────────
function JudicialIntelligence({ synthesis, fallbackSnippets }: { synthesis: string; fallbackSnippets: string[] }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section>
      <SectionLabel
        icon={<Sparkles className="w-3 h-3" />} number="3" title="Judicial Intelligence"
        audience={{ label: 'For Lawyers & Researchers', chip: 'bg-gold/15 text-amber-700' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="bg-white border border-gold/20 rounded-2xl p-5 shadow-[0_2px_12px_rgba(201,168,76,0.06)]">
          <div className="border-l-2 border-gold/40 pl-4">
            {synthesis ? (
              <p className="font-body text-sm text-ink/80 leading-relaxed text-justify">{synthesis}</p>
            ) : (
              <div className="space-y-2">
                {fallbackSnippets.map((s, i) => (
                  <p key={i} className="font-body text-sm text-ink/70 leading-relaxed">
                    <span className="text-gold font-black">▸</span> {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── § 4 Know Your Judges ────────────────────────────────────────────────────
function JudgeCard({ judge }: { judge: JudgeProfile }) {
  const { currentUser }               = useAuth();
  const [expanded, setExpanded]       = useState(false);
  const [loading,  setLoading]        = useState(false);
  const [judgments, setJudgments]     = useState<{ title: string; url: string; snippet: string }[]>([]);

  const searchJudgments = async () => {
    if (judgments.length > 0) { setExpanded(e => !e); return; }
    setExpanded(true);
    setLoading(true);
    try {
      const token = currentUser ? await currentUser.getIdToken() : '';
      const res = await fetch(`/api/judgment-search?act=const&query=${encodeURIComponent(judge.name.replace('Justice ', ''))}&mode=keyword&court=all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setJudgments((data.results ?? []).slice(0, 4).map((r: any) => ({
          title: r.title, url: r.url, snippet: r.summary,
        })));
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="font-display text-sm text-ink leading-tight">{judge.name}</p>
              <p className="text-[10px] font-ui text-ink/40">{judge.years}</p>
            </div>
          </div>
          {judge.badge && (
            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-ink text-parchment">
              {judge.badge}
            </span>
          )}
        </div>
        <p className="font-body text-xs text-ink/60 leading-relaxed italic mb-2">"{judge.philosophy}"</p>
        <div className="bg-white/70 rounded-xl p-3 border border-amber-100">
          <p className="text-[9px] font-black uppercase tracking-widest text-gold/70 font-ui mb-0.5">Landmark Case</p>
          <p className="font-ui font-bold text-xs text-ink leading-snug">{judge.landmarkCase}</p>
          <p className="font-body text-[11px] text-ink/50 leading-relaxed mt-1">{judge.caseNote}</p>
        </div>
        <button
          onClick={searchJudgments}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-800 transition-colors"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          Search Their Judgments
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Inline sub-panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-amber-200"
          >
            <div className="p-4 bg-white/50 space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-10 rounded-xl bg-ink/5 animate-shimmer" />)}
                </div>
              ) : judgments.length > 0 ? (
                judgments.map((j, i) => (
                  <a key={i} href={j.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2.5 bg-white border border-ink/8 rounded-xl hover:border-gold/30 transition-colors group"
                  >
                    <ExternalLink className="w-3 h-3 text-ink/30 group-hover:text-gold mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-ui font-bold text-xs text-ink leading-snug truncate">{j.title}</p>
                      {j.snippet && <p className="font-body text-[11px] text-ink/50 leading-relaxed line-clamp-2 mt-0.5">{j.snippet}</p>}
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-[11px] font-ui text-ink/40 text-center py-2">No results found — try a broader keyword search.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KnowYourJudges({ actId, judgesMentioned }: { actId: string; judgesMentioned: string[] }) {
  const [collapsed, setCollapsed] = useState(false);

  // Base judges from act + any extracted from search results
  const baseJudges   = getJudgesForAct(actId);
  const liveMatches  = matchJudgeProfiles(judgesMentioned);
  const merged       = [...liveMatches, ...baseJudges.filter(j => !liveMatches.find(m => m.id === j.id))].slice(0, 3);

  return (
    <section>
      <SectionLabel
        icon={<Award className="w-3 h-3" />} number="4" title="Know Your Judges"
        audience={{ label: 'For Students', chip: 'bg-amber-100 text-amber-700' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {merged.map(judge => (
            <JudgeCard key={judge.id} judge={judge} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── § 5 Official Precedents ─────────────────────────────────────────────────
function OfficialPrecedents({ results }: { results: JudgmentResult[] }) {
  const [collapsed, setCollapsed] = useState(false);
  if (results.length === 0) return null;
  return (
    <section>
      <SectionLabel
        icon={<Scale className="w-3 h-3" />} number="5" title="Landmark Precedents"
        audience={{ label: 'For Practitioners', chip: 'bg-ink/8 text-ink/60' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="space-y-3">
          {results.map((r, i) => {
            const bench = getBenchStrength(r.title + ' ' + r.summary);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white border border-ink/8 rounded-2xl p-5 hover:border-gold/30 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <CourtBadge court={r.court} />
                  {bench && <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${bench.cls}`}>{bench.label}</span>}
                  {r.date && <span className="text-[10px] font-ui text-gold">{r.date}</span>}
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${r.source === 'IndianKanoon' ? 'bg-burgundy/10 text-burgundy' : 'bg-gold/10 text-amber-700'}`}>{r.source}</span>
                </div>
                {/* Title — full, no truncation */}
                <p className="font-ui font-bold text-sm text-ink leading-snug mb-2">{r.title}</p>
                {/* Full summary */}
                {r.summary && (
                  <p className="font-body text-sm text-ink/70 leading-relaxed">{r.summary}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── § 6 IPC→BNS Bridge ──────────────────────────────────────────────────────
function ActBridge({ actId, query }: { actId: string; query: string }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!BRIDGE_ACT_IDS.has(actId)) return null;
  const mappings = getBridgeMappings(actId, query);
  if (mappings.length === 0) return null;
  const sectionNum = query.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  const newActLabel = ACT_NEW_LABEL[actId] ?? '';

  return (
    <section>
      <SectionLabel
        icon={<ArrowRight className="w-3 h-3" />} number="6" title={`${mappings[0].oldAct} → ${newActLabel} Bridge`}
        audience={{ label: 'For Practitioners', chip: 'bg-slate-100 text-slate-600' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="overflow-x-auto rounded-2xl border border-ink/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-parchment border-b border-ink/8 text-[9px] font-black uppercase tracking-widest text-ink/35 font-ui">
                <th className="px-4 py-2.5 text-left">Old Act</th>
                <th className="px-4 py-2.5 text-left">Old §</th>
                <th className="px-4 py-2.5 text-left">Topic</th>
                <th className="px-2 py-2.5 text-center"></th>
                <th className="px-4 py-2.5 text-left">New Act</th>
                <th className="px-4 py-2.5 text-left">New §</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-ink/5">
              {mappings.map((m, i) => {
                const isHighlighted = sectionNum && (m.oldSection.toUpperCase() === sectionNum || m.newSection.toUpperCase() === sectionNum);
                return (
                  <tr key={i} className={`transition-colors ${isHighlighted ? 'bg-gold/8' : 'hover:bg-parchment/40'}`}>
                    <td className="px-4 py-3 font-black text-[10px] text-ink/50 font-ui">{m.oldAct}</td>
                    <td className="px-4 py-3">
                      <span className={`font-black text-sm font-ui ${isHighlighted ? 'text-gold' : 'text-ink'}`}>§ {m.oldSection}</span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-ink/60 leading-snug">{m.topic}</td>
                    <td className="px-2 py-3 text-center"><ArrowRight className="w-3.5 h-3.5 text-gold/60 mx-auto" /></td>
                    <td className="px-4 py-3 font-black text-[10px] text-burgundy/60 font-ui">{m.newAct}</td>
                    <td className="px-4 py-3">
                      <span className={`font-black text-sm font-ui ${isHighlighted ? 'text-burgundy' : 'text-burgundy/70'}`}>§ {m.newSection}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-2 text-[10px] font-ui text-ink/30 bg-parchment/40 border-t border-ink/5">
            New criminal laws — BNS, BNSS &amp; BSA — came into force 1 July 2024 replacing IPC, CrPC &amp; IEA.
          </p>
        </div>
      )}
    </section>
  );
}

// ─── § 7 Exam Radar ───────────────────────────────────────────────────────────
function ExamRadar({ actId, query, examAngle }: { actId: string; query: string; examAngle: string }) {
  const [collapsed,    setCollapsed]    = useState(false);
  const [showAnswer,   setShowAnswer]   = useState(false);
  const freq = EXAM_FREQ[actId];
  const quiz = findMatchingQuiz(actId, query);

  return (
    <section>
      <SectionLabel
        icon={<Zap className="w-3 h-3" />} number="7" title="Exam Radar"
        audience={{ label: 'For Aspirants', chip: 'bg-slate-100 text-slate-600' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden">
          <div className="p-5 space-y-4">
            {/* Frequency */}
            {freq && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${freq.color}`}>
                  <Zap className="w-3 h-3" /> {freq.label} Frequency
                </span>
                <span className="text-[11px] font-ui text-slate-400">{freq.exams}</span>
              </div>
            )}

            {/* Groq exam tip */}
            {examAngle && (
              <p className="font-body text-sm text-gold/90 italic leading-relaxed border-l-2 border-gold/40 pl-3">
                {examAngle}
              </p>
            )}

            {/* MCQ */}
            {quiz ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-ui">Practice MCQ</p>
                <p className="font-ui font-bold text-sm text-white leading-snug">{quiz.q}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quiz.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setShowAnswer(true)}
                      className={`text-left px-3 py-2 rounded-lg text-[11px] font-ui font-bold border transition-all ${
                        showAnswer && i === quiz.correct
                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                          : showAnswer && i !== quiz.correct
                          ? 'bg-white/3 border-white/5 text-slate-500'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-slate-500 mr-1">{String.fromCharCode(65 + i)}.</span> {opt}
                    </button>
                  ))}
                </div>
                {showAnswer && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-wider text-green-400 mb-1 font-ui">Explanation</p>
                    <p className="font-body text-xs text-slate-300 leading-relaxed">{quiz.explanation}</p>
                    <p className="text-[10px] font-ui text-slate-500 mt-1">{quiz.subject}</p>
                  </motion.div>
                )}
                {!showAnswer && (
                  <p className="text-[10px] font-ui text-slate-500">Click any option to reveal the answer</p>
                )}
              </div>
            ) : (
              <p className="text-[11px] font-ui text-slate-400 italic">
                No matching MCQ for this section in our database — try searching core sections like §302 IPC or Article 21.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── § 8 News Narrative ───────────────────────────────────────────────────────
function NewsNarrative({ newsResults }: { newsResults: NewsResult[] }) {
  const [collapsed, setCollapsed] = useState(false);
  if (newsResults.length === 0) return null;

  const sourceChip: Record<string, string> = {
    'LiveLaw': 'bg-teal-100 text-teal-700', 'Bar & Bench': 'bg-amber-100 text-amber-700',
    'SC Observer': 'bg-purple-100 text-purple-700', 'LatestLaws': 'bg-blue-100 text-blue-700',
  };

  return (
    <section>
      <SectionLabel
        icon={<Newspaper className="w-3 h-3" />} number="8" title="News Narrative"
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {newsResults.map((n, i) => (
            <motion.a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white border border-ink/8 rounded-xl p-4 flex flex-col gap-2 hover:border-gold/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${sourceChip[n.source] ?? 'bg-ink/8 text-ink/60'}`}>{n.source}</span>
                {n.date && <span className="text-[10px] font-ui text-ink/30 shrink-0">{n.date}</span>}
              </div>
              <p className="font-ui font-bold text-sm text-ink leading-snug group-hover:text-burgundy transition-colors">{n.headline}</p>
              {n.snippet && <p className="font-body text-xs text-ink/50 leading-relaxed">{n.snippet}</p>}
              <div className="flex items-center gap-1 text-[10px] font-ui text-ink/30 group-hover:text-gold transition-colors mt-auto pt-1">
                <ExternalLink className="w-3 h-3" /> Read Article
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── § 9 Know Your Lawyer ────────────────────────────────────────────────────
function KnowYourLawyer({ actId }: { actId: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const lawyerType = LAWYER_TYPE[actId] ?? 'Legal Professional';

  const WHAT_TO_EXPECT: Record<string, string[]> = {
    ipc:   ['A criminal lawyer will review the FIR and advise whether charges are bailable or non-bailable', 'They can file for bail before the Sessions Court or High Court', 'They will represent you at trial and cross-examine prosecution witnesses'],
    bns:   ['A criminal lawyer familiar with BNS 2023 will identify if the new section applies to your matter', 'They will check whether the transitional provisions protect your existing rights', 'They can challenge incorrect section application before the Magistrate'],
    crpc:  ['A criminal procedure lawyer can file anticipatory bail if arrest is feared', 'They can challenge illegal detention via habeas corpus', 'They will ensure police follow correct FIR and chargesheet timelines'],
    bnss:  ['A BNSS-specialist lawyer will verify 60/90 day chargesheet timelines are followed', 'They can file bail applications under the new regime', 'They will identify trial-stage rights under the updated procedure'],
    iea:   ['An evidence lawyer can challenge admissibility of electronic records under §65B', 'They can cross-examine expert witnesses on forensic evidence', 'They advise on what documents are admissible and how to present them'],
    bsa:   ['A BSA-specialist will advise on new rules for electronic evidence under §63', 'They can argue admissibility of digital documents before the court', 'They ensure proper certification requirements are followed'],
    cpc:   ['A civil lawyer will draft your plaint and value the suit correctly', 'They can apply for temporary injunctions and interim relief', 'They manage appeals, revisions, and execution of decrees'],
    ca:    ['A corporate lawyer can file before the NCLT for insolvency or oppression matters', 'They advise on board resolutions, share transfers, and compliance filings', 'They handle MCA portal filings and statutory audit requirements'],
    const: ['A constitutional lawyer can file writ petitions in the High Court or Supreme Court', 'They can seek interim stay on executive or legislative action', 'They argue fundamental rights violations before constitutional benches'],
  };

  const steps = WHAT_TO_EXPECT[actId] ?? WHAT_TO_EXPECT['const'];

  return (
    <section>
      <SectionLabel
        icon={<Briefcase className="w-3 h-3" />} number="9" title="Know Your Lawyer"
        audience={{ label: 'For Citizens', chip: 'bg-emerald-100 text-emerald-700' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <div className="space-y-4">
          {/* Lawyer type badge + what to expect */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-[11px] font-black uppercase tracking-wider text-emerald-700">
                <Briefcase className="w-3 h-3" /> {lawyerType}
              </span>
              <span className="text-[11px] font-ui text-ink/40">recommended for this matter</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/60 font-ui mb-3">What a {lawyerType} will do for you</p>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-white border border-emerald-100 rounded-xl p-3">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700">{i + 1}</div>
                  <p className="font-body text-sm text-ink/80 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Free legal aid */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-ink/30 font-ui mb-2">Free Legal Aid in India</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'NALSA', desc: 'National Legal Services Authority — free legal aid for eligible citizens. SC, ST, women, disabled, persons with income below ₹1 lakh.', phone: '15100' },
                { name: 'District Legal Services Authority (DLSA)', desc: 'Present in every district court. Walk in and ask for a duty lawyer. Free advice and representation.', phone: null },
                { name: 'Tele-Law / eSewa Kendra', desc: 'Free video consultation with a panel lawyer at your nearest Common Service Centre (CSC). Available in all villages.', phone: null },
              ].map((aid, i) => (
                <div key={i} className="bg-white border border-emerald-100 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-ui font-black text-xs text-ink mb-1">{aid.name}</p>
                      <p className="font-body text-[11px] text-ink/60 leading-relaxed">{aid.desc}</p>
                      {aid.phone && (
                        <p className="mt-1.5 text-[11px] font-black text-emerald-600 font-ui">Helpline: {aid.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── § 10 Citation Hub ────────────────────────────────────────────────────────
function CitationHub({ results }: { results: JudgmentResult[] }) {
  const [collapsed, setCollapsed] = useState(false);
  if (results.length === 0) return null;
  return (
    <section>
      <SectionLabel
        icon={<Library className="w-3 h-3" />} number="10" title="Citation Hub"
        audience={{ label: 'For Advocates', chip: 'bg-ink/8 text-ink/60' }}
        collapsible collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}
      />
      {!collapsed && (
        <>
          <div className="bg-white border border-ink/8 rounded-2xl divide-y divide-ink/5 overflow-hidden">
            {results.map((r, i) => {
              const citation = `${r.title}${r.date ? ` (${r.date})` : ''} — ${r.court}. Source: ${r.url}`;
              return (
                <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-parchment/40 transition-colors">
                  <div className="flex-1">
                    <p className="font-ui text-xs text-ink/70 leading-snug">
                      <span className="font-black text-ink">{r.title}</span>
                      {r.date && <span className="text-gold"> ({r.date})</span>}
                      {' '}— <span className="text-ink/40">{r.court}</span>
                    </p>
                  </div>
                  <CopyButton text={citation} />
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] font-ui text-ink/30 text-center">
            Format: Case Name (Year) — Court · Source URL
          </p>
        </>
      )}
    </section>
  );
}

// ─── Digest Card ──────────────────────────────────────────────────────────────
function DigestCard({ digest }: { digest: typeof DIGEST_POOL[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="bg-parchment border border-ink/8 rounded-2xl overflow-hidden"
    >
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between gap-3 p-4 text-left">
        <div className="flex-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-gold">{digest.subject}</span>
          <p className="font-ui font-bold text-sm text-ink mt-0.5 leading-snug">{digest.title}</p>
          <p className="text-[10px] font-ui text-ink/40 mt-0.5">{digest.court} · {digest.date}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-ink/30 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-ink/5 pt-3">
              {[{ label: 'Facts', text: digest.facts }, { label: 'Issue', text: digest.issue }, { label: 'Held', text: digest.held }, { label: 'Impact', text: digest.impact }].map(row => (
                <div key={row.label}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-ink/30 mb-0.5">{row.label}</p>
                  <p className="font-body text-xs text-ink/70 leading-relaxed">{row.text}</p>
                </div>
              ))}
              <p className="text-[10px] font-ui font-bold text-gold/70">{digest.citation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Paywall Overlay ─────────────────────────────────────────────────────────
function PaywallOverlay({
  reason,
  usageInfo,
  onDismiss,
}: {
  reason: UsageReason;
  usageInfo: UsageInfo | null;
  onDismiss: () => void;
}) {
  const notSignedIn = reason === 'not_signed_in';

  const headings: Record<UsageReason, string> = {
    not_signed_in: 'Sign in to use Case Law Finder',
    free_limit:    'Your free search is used up',
    monthly_limit: 'Monthly limit reached',
    daily_limit:   'Daily limit reached',
    ok:            '',
  };

  const subCopy: Record<UsageReason, string> = {
    not_signed_in: 'Create a free account to get 1 complimentary search. Subscribe for unlimited access.',
    free_limit:    'You\'ve used your 1 free search. Subscribe to continue researching.',
    monthly_limit: `You've used all ${usageInfo?.limit ?? 30} searches for this month. Upgrade to Max for 50 searches/day.`,
    daily_limit:   `You've used all ${usageInfo?.limit ?? 50} searches today. Your quota resets tomorrow at midnight.`,
    ok:            '',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Blue panel backdrop */}
      <div className="fixed inset-0 bg-blue-950/75 backdrop-blur-sm" onClick={onDismiss} />

      {/* Scroll container — flex so modal centres on tall screens, scrolls on short ones */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-ink/10 overflow-hidden"
      >
        {/* Gold top bar */}
        <div className="h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

        <div className="p-8">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-5 mx-auto">
            {notSignedIn
              ? <LogIn className="w-7 h-7 text-gold" />
              : <Lock className="w-7 h-7 text-gold" />
            }
          </div>

          <h2 className="font-display text-2xl text-ink text-center mb-2">
            {headings[reason]}
          </h2>
          <p className="font-body text-sm text-ink/60 text-center leading-relaxed mb-8">
            {subCopy[reason]}
          </p>

          {/* Plan cards (not shown for daily_limit — upgrade prompt instead) */}
          {(reason === 'free_limit' || reason === 'not_signed_in') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Pro */}
              <div className="border border-burgundy/20 rounded-2xl p-4 bg-burgundy/3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Crown className="w-3.5 h-3.5 text-burgundy" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-burgundy">Pro</span>
                </div>
                <p className="font-display text-xl text-ink mb-0.5">₹499<span className="text-xs font-body text-ink/40">/mo</span></p>
                <p className="text-[11px] font-ui text-ink/50 mb-3">30 searches / month</p>
                <ul className="space-y-1 text-[11px] font-ui text-ink/60">
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500 shrink-0" /> Monthly Digest</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500 shrink-0" /> Daily Newsletter</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500 shrink-0" /> 1 free service/month</li>
                </ul>
              </div>
              {/* Max */}
              <div className="border border-gold/30 rounded-2xl p-4 bg-gold/5 relative">
                <div className="absolute -top-2 right-3 px-2 py-0.5 bg-gold text-ink text-[8px] font-black uppercase tracking-widest rounded-full shadow">Best</div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold">Max</span>
                </div>
                <p className="font-display text-xl text-ink mb-0.5">₹999<span className="text-xs font-body text-ink/40">/mo</span></p>
                <p className="text-[11px] font-ui text-ink/50 mb-3">50 searches / day</p>
                <ul className="space-y-1 text-[11px] font-ui text-ink/60">
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500 shrink-0" /> Unlimited MCQs</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500 shrink-0" /> Priority support</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500 shrink-0" /> 2 free services/month</li>
                </ul>
              </div>
            </div>
          )}

          {/* Monthly limit — upgrade nudge */}
          {reason === 'monthly_limit' && (
            <div className="flex items-center gap-3 bg-gold/8 border border-gold/20 rounded-2xl p-4 mb-6">
              <Star className="w-5 h-5 text-gold shrink-0" />
              <div>
                <p className="font-ui font-black text-sm text-ink">Upgrade to Max</p>
                <p className="text-[11px] font-ui text-ink/50">Get 50 searches every day instead of 30/month.</p>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            {notSignedIn ? (
              <>
                <Link
                  to="/login"
                  className="w-full h-12 bg-ink text-parchment rounded-xl font-ui text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-ink/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Register Free
                </Link>
                <Link
                  to="/subscription"
                  className="w-full h-12 border border-gold/30 bg-gold/8 text-ink rounded-xl font-ui text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gold/15 transition-colors"
                >
                  <Crown className="w-4 h-4 text-gold" /> View Plans
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/subscription"
                  className="w-full h-12 bg-ink text-parchment rounded-xl font-ui text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-ink/90 transition-colors"
                >
                  <Crown className="w-4 h-4 text-gold" /> Subscribe to Continue
                </Link>
                <button
                  onClick={onDismiss}
                  className="w-full h-10 text-ink/40 font-ui text-xs hover:text-ink/60 transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
      </div>{/* end scroll container */}
    </motion.div>
  );
}

// ─── Usage Progress Bar ───────────────────────────────────────────────────────
function UsageBar({ usageInfo, isPro, isMax }: { usageInfo: UsageInfo | null; isPro: boolean; isMax: boolean }) {
  if (!usageInfo) return null;
  const { used, limit, period } = usageInfo;
  if (limit === 0) return null;

  const pct = Math.min(100, (used / limit) * 100);
  const barColor = pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-400';
  const tierLabel = isMax ? 'Max' : isPro ? 'Pro' : 'Free';
  const tierColor = isMax ? 'text-gold' : isPro ? 'text-burgundy' : 'text-ink/40';

  return (
    <div className="flex items-center gap-3 ml-1">
      <span className={`text-[10px] font-black uppercase tracking-widest font-ui ${tierColor}`}>{tierLabel}</span>
      <div className="flex-1 h-1.5 bg-ink/8 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-ui text-ink/35 shrink-0">
        {used}/{limit} {period}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JudgementFinder() {
  const { currentUser, isPro, isMax } = useAuth();
  const [actId, setActId]               = useState('ipc');
  const [query, setQuery]               = useState('');
  const [mode,  setMode]                = useState<SearchMode>('section');
  const [court, setCourt]               = useState<CourtFilter>('all');
  const [status, setStatus]             = useState<SearchStatus>('idle');
  const [results, setResults]           = useState<JudgmentResult[]>([]);
  const [newsResults, setNewsResults]   = useState<NewsResult[]>([]);
  const [, setLawyerResults] = useState<LawyerResult[]>([]);
  const [judgesMentioned, setJudgesMentioned] = useState<string[]>([]);
  const [synthesis, setSynthesis]       = useState('');
  const [plainEnglish, setPlainEnglish] = useState('');
  const [citizenRights, setCitizenRights] = useState<string[]>([]);
  const [examAngle, setExamAngle]       = useState('');
  const [errorMsg, setErrorMsg]         = useState('');
  const [noToken, setNoToken]           = useState(false);
  const [reportMeta, setReportMeta]     = useState<{ query: string; act: string; court: string } | null>(null);

  // ── Paywall / usage state ──────────────────────────────────────────────────
  const [showPaywall, setShowPaywall]   = useState(false);
  const [paywallReason, setPaywallReason] = useState<UsageReason>('not_signed_in');
  const [liveUsage, setLiveUsage]       = useState<UsageInfo | null>(null);

  // Pre-load usage info on mount / when auth state changes
  useEffect(() => {
    if (!currentUser) { setLiveUsage(null); return; }
    checkCanSearch(currentUser, isPro, isMax).then(r => setLiveUsage(r.usageInfo));
  }, [currentUser, isPro, isMax]);

  const selectedAct = MAJOR_ACTS.find(a => a.id === actId)!;
  const digests     = relatedDigests(actId);

  const PLACEHOLDER: Record<SearchMode, string> = {
    section:  selectedAct.id === 'const' ? 'e.g. 21, 32, 226' : 'e.g. 302, 420, 377',
    keyword:  'e.g. anticipatory bail telecom',
    citation: 'e.g. AIR 2023 SC 1234',
  };

  const MODE_ICONS: Record<SearchMode, React.ReactNode> = {
    section:  <FileText className="w-4 h-4" />,
    keyword:  <Search   className="w-4 h-4" />,
    citation: <Quote    className="w-4 h-4" />,
  };

  const clearResults = () => {
    setStatus('idle'); setResults([]); setNewsResults([]); setLawyerResults([]);
    setJudgesMentioned([]); setSynthesis(''); setPlainEnglish('');
    setCitizenRights([]); setExamAngle(''); setErrorMsg(''); setNoToken(false); setReportMeta(null);
    setShowPaywall(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    // ── Auth gate ──────────────────────────────────────────────────────────
    if (!currentUser) {
      setPaywallReason('not_signed_in');
      setShowPaywall(true);
      return;
    }

    // ── Usage gate ─────────────────────────────────────────────────────────
    const check = await checkCanSearch(currentUser, isPro, isMax);
    setLiveUsage(check.usageInfo);
    if (!check.allowed) {
      setPaywallReason(check.reason);
      setShowPaywall(true);
      return;
    }

    setStatus('searching');
    clearResults();
    setStatus('searching'); // re-set after clearResults

    try {
      const token = await currentUser.getIdToken();
      const params = new URLSearchParams({ act: actId, query: query.trim(), mode, court });
      const res  = await fetch(`/api/judgment-search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) {
        setNoToken(data.error === 'no_key' || data.error === 'no_token');
        if (!noToken) setErrorMsg(data.error ?? 'Search failed. Please try again.');
        setStatus('error');
        return;
      }

      setResults(data.results          ?? []);
      setNewsResults(data.newsResults   ?? []);
      setLawyerResults(data.lawyerResults ?? []);
      setJudgesMentioned(data.judgesMentioned ?? []);
      setSynthesis(data.synthesis       ?? '');
      setPlainEnglish(data.plainEnglish ?? '');
      setCitizenRights(data.citizenRights ?? []);
      setExamAngle(data.examAngle       ?? '');
      setReportMeta({ query: query.trim(), act: selectedAct.name, court: COURT_LABELS[court] });
      setStatus('results');

      // Record the successful search and refresh usage display
      await recordSearch(currentUser, isPro, isMax);
      const updated = await checkCanSearch(currentUser, isPro, isMax);
      setLiveUsage(updated.usageInfo);
    } catch {
      setErrorMsg('Network error. Check your connection and try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-parchment pt-24 pb-24">
      <Helmet>
        <title>Legal Intelligence Suite — Judgments · Rights · Exam Prep | EduLaw</title>
        <meta name="description" content="India's most complete legal research tool — live Supreme Court judgments, citizen rights, IPC→BNS transition mapping, exam MCQs, judge profiles and lawyer directory in one place." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full text-gold text-xs font-black uppercase tracking-[0.25em] mb-6"
          >
            <Scale className="w-4 h-4" /> Legal Intelligence Suite
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-tight mb-5">
            Find the <span className="italic text-burgundy underline decoration-gold/30 underline-offset-8">Verdict</span>
          </h1>
          <p className="font-body text-ink/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            For citizens, students, aspirants and lawyers — plain English explainers, live precedents,
            IPC→BNS mapping, judge profiles, exam MCQs and a lawyer directory. All on EduLaw.
          </p>
        </div>

        {/* ── Search Card ── */}
        <div className="bg-white rounded-[2.5rem] border border-ink/10 shadow-2xl overflow-hidden">
          <form onSubmit={handleSearch} className="p-6 sm:p-8 space-y-6">

            {/* Act selector */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ink/40 mb-2 ml-1">Select Act / Statute</label>
              <div className="relative">
                <select value={actId} onChange={e => { setActId(e.target.value); clearResults(); }}
                  className="w-full h-13 pl-5 pr-12 py-3.5 bg-parchment border border-ink/10 rounded-2xl font-ui text-sm font-bold text-ink appearance-none focus:outline-none focus:border-gold/50 transition-colors cursor-pointer"
                >
                  {MAJOR_ACTS.map(act => <option key={act.id} value={act.id}>{act.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink/30">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-1.5 ml-1 text-[10px] font-ui text-ink/35">{selectedAct.sections} sections · {selectedAct.name}</p>
            </div>

            {/* Mode toggle */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ink/40 mb-2 ml-1">Search Mode</label>
              <div className="flex flex-wrap gap-2">
                {(['section', 'keyword', 'citation'] as SearchMode[]).map(m => (
                  <button key={m} type="button" onClick={() => { setMode(m); setQuery(''); clearResults(); }}
                    className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-ui text-xs font-bold transition-all ${mode === m ? 'bg-ink text-parchment shadow-md' : 'bg-parchment border border-ink/8 text-ink/50 hover:text-ink hover:border-ink/20'}`}
                  >
                    {MODE_ICONS[m]} {m === 'section' ? 'By Section' : m === 'keyword' ? 'By Keyword' : 'By Citation'}
                  </button>
                ))}
              </div>
            </div>

            {/* Court filter */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ink/40 mb-2 ml-1">Court</label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(COURT_LABELS) as CourtFilter[]).map(c => (
                  <button key={c} type="button" onClick={() => setCourt(c)}
                    className={`px-4 py-3 rounded-xl font-ui text-xs font-bold transition-all ${court === c ? 'bg-burgundy text-white shadow-md' : 'bg-parchment border border-ink/8 text-ink/50 hover:text-ink hover:border-ink/20'}`}
                  >
                    {COURT_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>

            {/* Query input */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-ink/40 mb-2 ml-1">
                {mode === 'section' ? (selectedAct.id === 'const' ? 'Article Number' : 'Section Number') : mode === 'keyword' ? 'Search Terms' : 'Citation'}
              </label>
              <input type="text" placeholder={PLACEHOLDER[mode]} value={query} onChange={e => setQuery(e.target.value)}
                className="w-full h-13 px-5 py-3.5 bg-parchment border border-ink/10 rounded-2xl font-ui text-sm font-bold text-ink placeholder:text-ink/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {/* Search button */}
            <button type="submit" disabled={status === 'searching' || !query.trim()}
              className="w-full h-14 bg-ink text-parchment rounded-[1.25rem] font-ui text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-ink/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-ink/20"
            >
              {status === 'searching'
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating Report…</>
                : !currentUser
                  ? <><LogIn className="w-4 h-4" /> Sign In to Search</>
                  : <><Search className="w-4 h-4" /> Generate Intelligence Report</>
              }
            </button>

            {/* Usage progress bar */}
            {currentUser && liveUsage && (
              <UsageBar usageInfo={liveUsage} isPro={isPro} isMax={isMax} />
            )}
            {!currentUser && (
              <div className="flex items-center gap-2 ml-1">
                <LogIn className="w-3 h-3 text-ink/30 shrink-0" />
                <span className="text-[10px] font-ui text-ink/35">
                  <Link to="/login" className="underline hover:text-burgundy transition-colors">Sign in</Link> for 1 free search · <Link to="/subscription" className="underline hover:text-gold transition-colors">Subscribe</Link> for Pro or Max access
                </span>
              </div>
            )}

            <div className="flex items-start gap-2 text-[10px] font-ui text-ink/35 ml-1">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              <span>10-section Legal Intelligence Suite — plain English, rights, live precedents, IPC→BNS bridge, exam MCQs, judge profiles &amp; lawyer directory.</span>
            </div>
          </form>

          {/* Skeleton */}
          <AnimatePresence>
            {status === 'searching' && (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ReportSkeleton />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Report — wrapped in relative container for paywall overlay */}
          <div className="relative">
            <AnimatePresence>
              {showPaywall && (
                <PaywallOverlay
                  reason={paywallReason}
                  usageInfo={liveUsage}
                  onDismiss={() => setShowPaywall(false)}
                />
              )}
            </AnimatePresence>

          <AnimatePresence>
            {(status === 'results' || status === 'error') && (
              <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }} className="border-t border-gold/20 overflow-hidden"
              >
                {/* Error */}
                {status === 'error' && (
                  <div className="p-6 sm:p-8 bg-[#FAFAF8]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg text-ink">{noToken ? 'API Key Required' : 'Search Failed'}</h3>
                      <button onClick={clearResults} className="text-[10px] font-ui font-black uppercase tracking-widest text-gold hover:underline">Clear</button>
                    </div>
                    {noToken ? (
                      <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5">
                        <p className="font-ui font-black text-sm text-ink">Add <code className="bg-ink/8 px-1 rounded text-[11px]">SERPER_API_KEY</code> to Vercel environment variables and redeploy.</p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="font-body text-sm text-red-700">{errorMsg}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Full 10-section report */}
                {status === 'results' && (
                  <div className="bg-[#FAFAF8]">
                    {/* Report Header */}
                    <div className="relative overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-gold/40 via-gold to-gold/40" />
                      <div className="px-6 sm:px-8 py-5 flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gold/70 font-ui mb-1">EduLaw Legal Intelligence Suite</p>
                          <h3 className="font-display text-xl sm:text-2xl text-ink leading-snug">
                            {reportMeta?.query && <span className="italic text-burgundy">&ldquo;{reportMeta.query}&rdquo;</span>}
                            {reportMeta?.act && <span className="text-ink/50 font-body text-base"> · {reportMeta.act.split('(')[0].trim()}</span>}
                          </h3>
                          <p className="text-[10px] font-ui text-ink/35 mt-1">
                            {reportMeta?.court} · {results.length} Precedent{results.length !== 1 ? 's' : ''} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <button onClick={clearResults} className="shrink-0 text-[10px] font-ui font-black uppercase tracking-widest text-gold/60 hover:text-gold transition-colors">Clear</button>
                      </div>
                    </div>

                    <div className="px-6 sm:px-8 pb-8 space-y-8">
                      {plainEnglish  && <KnowTheLaw text={plainEnglish} />}
                      {citizenRights.length > 0 && <KnowYourRights rights={citizenRights} />}
                      {(synthesis || results.length > 0) && (
                        <JudicialIntelligence synthesis={synthesis} fallbackSnippets={results.slice(0, 3).map(r => r.summary)} />
                      )}
                      <KnowYourJudges actId={actId} judgesMentioned={judgesMentioned} />
                      <OfficialPrecedents results={results} />
                      <ActBridge actId={actId} query={query} />
                      <ExamRadar actId={actId} query={query} examAngle={examAngle} />
                      {newsResults.length > 0 && <NewsNarrative newsResults={newsResults} />}
                      <KnowYourLawyer actId={actId} />
                      <CitationHub results={results} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>{/* end relative paywall wrapper */}
        </div>

        {/* Landmark Digests */}
        {digests.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-ink/8" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-ink/30 font-ui whitespace-nowrap">
                EduLaw Landmark Digests · {selectedAct.name.split(' ').slice(0, 3).join(' ')}
              </span>
              <div className="flex-1 h-px bg-ink/8" />
            </div>
            <div className="space-y-3">
              {digests.map(d => <DigestCard key={d.id} digest={d} />)}
            </div>
            <p className="mt-4 text-center text-[10px] font-ui text-ink/30">Curated and fact-checked by EduLaw editors · Updated regularly</p>
          </div>
        )}
      </div>
    </div>
  );
}
