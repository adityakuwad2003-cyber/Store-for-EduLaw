import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from 'firebase/auth';

export type UsageReason = 'ok' | 'not_signed_in' | 'free_limit' | 'monthly_limit' | 'daily_limit';

export interface UsageInfo {
  used: number;
  limit: number;
  period: string; // 'today' | 'this month' | 'lifetime'
}

export interface CheckResult {
  allowed: boolean;
  reason: UsageReason;
  usageInfo: UsageInfo;
}

// ── Key helpers ─────────────────────────────────────────────────────────────
function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // "2026-04-17"
}
function getMonthKey() {
  return new Date().toISOString().slice(0, 7);  // "2026-04"
}

// ── Check whether the user is allowed to run a search ───────────────────────
export async function checkCanSearch(
  user: User | null,
  isPro: boolean,
  isMax: boolean,
): Promise<CheckResult> {
  if (!user) {
    return { allowed: false, reason: 'not_signed_in', usageInfo: { used: 0, limit: 0, period: '' } };
  }

  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const usage = snap.exists() ? (snap.data()?.judgmentUsage ?? {}) : {};

  // ── Max: 50 searches per calendar day ────────────────────────────────────
  if (isMax) {
    const dayKey = getTodayKey();
    const daily  = usage.daily ?? {};
    const count  = daily.day === dayKey ? (daily.count ?? 0) : 0;
    if (count >= 50) {
      return { allowed: false, reason: 'daily_limit', usageInfo: { used: count, limit: 50, period: 'today' } };
    }
    return { allowed: true, reason: 'ok', usageInfo: { used: count, limit: 50, period: 'today' } };
  }

  // ── Pro: 30 searches per calendar month ───────────────────────────────────
  if (isPro) {
    const monthKey = getMonthKey();
    const monthly  = usage.monthly ?? {};
    const count    = monthly.month === monthKey ? (monthly.count ?? 0) : 0;
    if (count >= 30) {
      return { allowed: false, reason: 'monthly_limit', usageInfo: { used: count, limit: 30, period: 'this month' } };
    }
    return { allowed: true, reason: 'ok', usageInfo: { used: count, limit: 30, period: 'this month' } };
  }

  // ── Free: 1 search lifetime ───────────────────────────────────────────────
  if (usage.freeUsed) {
    return { allowed: false, reason: 'free_limit', usageInfo: { used: 1, limit: 1, period: 'lifetime' } };
  }
  return { allowed: true, reason: 'ok', usageInfo: { used: 0, limit: 1, period: 'lifetime' } };
}

// ── Atomically record a completed search ────────────────────────────────────
export async function recordSearch(
  user: User | null,
  isPro: boolean,
  isMax: boolean,
): Promise<void> {
  if (!user) return;

  const ref = doc(db, 'users', user.uid);

  if (isMax) {
    const dayKey = getTodayKey();
    const snap   = await getDoc(ref);
    const daily  = snap.exists() ? (snap.data()?.judgmentUsage?.daily ?? {}) : {};
    if (daily.day === dayKey) {
      await updateDoc(ref, { 'judgmentUsage.daily.count': increment(1) });
    } else {
      await setDoc(ref, { judgmentUsage: { daily: { day: dayKey, count: 1 } } }, { merge: true });
    }
    return;
  }

  if (isPro) {
    const monthKey = getMonthKey();
    const snap     = await getDoc(ref);
    const monthly  = snap.exists() ? (snap.data()?.judgmentUsage?.monthly ?? {}) : {};
    if (monthly.month === monthKey) {
      await updateDoc(ref, { 'judgmentUsage.monthly.count': increment(1) });
    } else {
      await setDoc(ref, { judgmentUsage: { monthly: { month: monthKey, count: 1 } } }, { merge: true });
    }
    return;
  }

  // Free user — mark the single lifetime search as used
  await setDoc(ref, { judgmentUsage: { freeUsed: true } }, { merge: true });
}
