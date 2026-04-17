import {
  collection, getDocs, addDoc, query, where, serverTimestamp, Timestamp,
  doc, getDoc, setDoc
} from "firebase/firestore";
import { db } from "./firebase";
import type { Note, Review } from "../types";

// ── Note MCQ Types ─────────────────────────────────────────────────────────

export interface NoteMCQQuestion {
  id: number;
  question: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface NoteMCQSet {
  noteSlug: string;
  noteTitle: string;
  updatedAt?: any;
  questions: NoteMCQQuestion[];
}

const REVIEWS_COLLECTION = "reviews";

export async function getReviews(noteId: string): Promise<Review[]> {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("noteId", "==", noteId)
    );
    const snap = await getDocs(q);
    const reviews = snap.docs.map(doc => {
      const d = doc.data();
      let createdAt = '';
      if (d.createdAt instanceof Timestamp) {
        createdAt = d.createdAt.toDate().toISOString();
      } else if (typeof d.createdAt === 'string') {
        createdAt = d.createdAt;
      }
      return { id: doc.id, ...d, createdAt } as Review;
    });

    // Sort in-memory to avoid composite index requirement
    return reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function hasUserReviewed(noteId: string, userId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where("noteId", "==", noteId),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
}

export async function submitReview(
  noteId: string,
  userId: string,
  userName: string,
  rating: number,
  text: string,
  userAffiliation?: string
): Promise<void> {
  const initial = (userName || 'A').charAt(0).toUpperCase();
  await addDoc(collection(db, REVIEWS_COLLECTION), {
    noteId,
    userId,
    userName: userName || 'Anonymous',
    userInitial: initial,
    rating,
    text: text.trim(),
    userAffiliation: userAffiliation || '',
    createdAt: serverTimestamp(),
  });
}

const COLLECTION_NAME = "notes";

// In-memory cache — avoids re-fetching on every page navigation
let _notesCache: Note[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function invalidateNotesCache() {
  _notesCache = null;
  _cacheTime = 0;
}

export async function getAllNotes(): Promise<Note[]> {
  if (_notesCache && Date.now() - _cacheTime < CACHE_TTL) {
    return _notesCache;
  }
  try {
    const notesCollection = collection(db, COLLECTION_NAME);
    const notesSnapshot = await getDocs(notesCollection);

    if (notesSnapshot.empty) {
      _notesCache = [];
      _cacheTime = Date.now();
      return [];
    }

    const notes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as unknown as Note));

    _notesCache = notes;
    _cacheTime = Date.now();
    return notes;
  } catch (error) {
    console.error("Error fetching notes from Firebase:", error);
    return [];
  }
}

export async function getNoteBySlug(slug: string): Promise<Note | undefined> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return undefined;

    const docData = querySnapshot.docs[0];
    return {
      id: docData.id,
      ...docData.data()
    } as unknown as Note;
  } catch (error) {
    console.error("Error fetching single note:", error);
    return undefined;
  }
}

// ── Note MCQs ──────────────────────────────────────────────────────────────

const MCQ_COLLECTION = 'note_mcqs';

/** Fetch the MCQ set for a given note slug. Returns null if not yet seeded. */
export async function getNoteMCQs(noteSlug: string): Promise<NoteMCQSet | null> {
  try {
    const ref = doc(db, MCQ_COLLECTION, noteSlug);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as NoteMCQSet;
  } catch (error) {
    console.error('Error fetching note MCQs:', error);
    return null;
  }
}

/** Save (create or overwrite) the MCQ set for a note. */
export async function saveNoteMCQs(
  noteSlug: string,
  data: Omit<NoteMCQSet, 'updatedAt'>
): Promise<void> {
  const ref = doc(db, MCQ_COLLECTION, noteSlug);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/** List all note slugs that have MCQs (for admin overview). */
export async function listNoteMCQSummaries(): Promise<
  { noteSlug: string; noteTitle: string; count: number }[]
> {
  try {
    const snap = await getDocs(collection(db, MCQ_COLLECTION));
    return snap.docs.map(d => {
      const data = d.data() as NoteMCQSet;
      return {
        noteSlug: d.id,
        noteTitle: data.noteTitle || d.id,
        count: data.questions?.length ?? 0,
      };
    });
  } catch (error) {
    console.error('Error listing MCQ summaries:', error);
    return [];
  }
}
