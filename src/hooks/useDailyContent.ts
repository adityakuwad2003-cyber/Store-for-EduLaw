import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { CaseLaw } from '../data/playground/caseLaws';
import type { QuizQuestion } from '../data/playground/quizData';
import type { ConstitutionArticle } from '../data/playground/constitutionData';
import type { LegalMaxim } from '../data/playground/maximsData';
import type { JudgmentDigest } from '../data/playground/judgmentDigests';
import { CASE_LAW_POOL } from '../data/playground/caseLaws';
import { QUIZ_POOL } from '../data/playground/quizData';
import { CONSTITUTION_POOL } from '../data/playground/constitutionData';
import { MAXIM_POOL } from '../data/playground/maximsData';
import { DIGEST_POOL } from '../data/playground/judgmentDigests';
import { db } from '../lib/firebase';

/** Deterministic daily seed — same items for all users globally. Flips at 00:00 UTC (5:30 AM IST) */
function getDailySeed(offset: number = 0): number {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const startOfYear = Date.UTC(utcYear, 0, 1);
  const currentUtcDate = Date.UTC(utcYear, now.getUTCMonth(), now.getUTCDate());
  
  const dayOfYear = Math.floor((currentUtcDate - startOfYear) / 86400000);
  return utcYear * 1000 + dayOfYear + offset;
}

function useGenericDaily<T>(type: string, pool: any[], count: number, offset: number): T[] {
  const fallback = useMemo(() => {
    const seed = getDailySeed(offset);
    const poolCopy = [...pool];
    const selected: T[] = [];
    let s = seed;
    for (let i = 0; i < count; i++) {
      s = Math.imul(s, 1664525) + 1013904223;
      selected.push(poolCopy.splice(Math.abs(s) % poolCopy.length, 1)[0] as T);
    }
    return selected;
  }, [pool, count, offset]);

  const [items, setItems] = useState<T[]>(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, 'playground_content'), where('type', '==', type));
        const snap = await getDocs(q);
        if (cancelled || snap.empty) return;
        
        let allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        // Client-side seeded picking from the firestore pool
        const seed = getDailySeed(offset);
        let s = seed;
        const selected: T[] = [];
        for (let i = 0; i < count && allDocs.length > 0; i++) {
          s = Math.imul(s, 1664525) + 1013904223;
          selected.push(allDocs.splice(Math.abs(s) % allDocs.length, 1)[0] as T);
        }
        if (selected.length > 0) setItems(selected);
      } catch {
        // silent fallback
      }
    })();
    return () => { cancelled = true; };
  }, [type, count, offset]);

  return items;
}

export function useCaseLawsDaily(): CaseLaw[] {
  return useGenericDaily<CaseLaw>('caselaw', CASE_LAW_POOL, 3, 0);
}

export function useQuizDaily(): QuizQuestion[] {
  return useGenericDaily<QuizQuestion>('quiz', QUIZ_POOL, 5, 7);
}

export function useConstitutionDaily(): ConstitutionArticle {
  return useGenericDaily<ConstitutionArticle>('constitution', CONSTITUTION_POOL, 1, 13)[0] || CONSTITUTION_POOL[0];
}

export function useMaximDaily(): LegalMaxim {
  return useGenericDaily<LegalMaxim>('maxim', MAXIM_POOL, 1, 19)[0] || MAXIM_POOL[0];
}

export function useDigestDaily(): JudgmentDigest[] {
  // Digests usually show recent ones in the admin panel instead of random
  const fallback = useMemo(() => {
    const seed = getDailySeed(31);
    const pool = [...DIGEST_POOL];
    const selected: JudgmentDigest[] = [];
    let s = seed;
    for (let i = 0; i < 5; i++) {
      s = Math.imul(s, 1664525) + 1013904223;
      selected.push(pool.splice(Math.abs(s) % pool.length, 1)[0] as JudgmentDigest);
    }
    return selected;
  }, []);

  const [items, setItems] = useState<JudgmentDigest[]>(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, 'playground_content'), where('type', '==', 'digest'));
        const snap = await getDocs(q);
        if (cancelled || snap.empty) return;
        const firestoreDigests = snap.docs
          .sort((a, b) => {
            const ta = a.data().createdAt?.toMillis?.() ?? 0;
            const tb = b.data().createdAt?.toMillis?.() ?? 0;
            return tb - ta;
          })
          .slice(0, 5)
          .map(d => ({ id: d.id, ...d.data() } as any));
        if (firestoreDigests.length > 0) setItems(firestoreDigests);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  return items;
}
