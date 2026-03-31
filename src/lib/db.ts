import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { notesData } from "../data/notes";
import type { Note } from "../types";

// Collection name in Firebase (We will expect 'products' or 'notes')
const COLLECTION_NAME = "notes";

/**
 * Fetches all notes from Firebase Firestore.
 * FALLBACK: If Firebase returns 0 notes (meaning the user hasn't uploaded data yet),
 * it returns the static `notesData` so the website doesn't completely break.
 */
export async function getAllNotes(): Promise<Note[]> {
  try {
    const notesCollection = collection(db, COLLECTION_NAME);
    const notesSnapshot = await getDocs(notesCollection);
    
    if (notesSnapshot.empty) {
      console.warn("Firebase 'notes' collection is empty. Falling back to local data.");
      return notesData;
    }

    const notesList = notesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Use Firebase Document ID as the Note ID natively
        ...data
      } as unknown as Note; 
    });

    return notesList;
  } catch (error) {
    console.error("Error fetching notes from Firebase:", error);
    // Silent fail safely to local data to prevent site crashes
    return notesData;
  }
}

/**
 * Fetches a single note by its slug or ID
 */
export async function getNoteBySlug(slug: string): Promise<Note | undefined> {
  try {
    // We query by the `slug` field rather than doc ID
    const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Fallback
      return notesData.find(n => n.slug === slug);
    }

    const docData = querySnapshot.docs[0];
    return {
        id: docData.id,
        ...docData.data()
    } as unknown as Note;
  } catch (error) {
    console.error("Error fetching single note:", error);
    return notesData.find(n => n.slug === slug);
  }
}
