import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Upserts a minimal Firestore user document on every sign-in.
 * Uses merge:true so existing data (subscription, isBanned, etc.) is never overwritten.
 */
async function upsertUserDoc(user: User) {
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        lastLoginAt: serverTimestamp(),
        // createdAt is only written on first document creation via merge
      },
      { merge: true }
    );
    // Only set createdAt if the document is brand new (won't overwrite existing)
    await setDoc(
      doc(db, "users", user.uid),
      { createdAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    // Non-fatal — app works fine even if this Firestore write fails
    console.warn("Could not upsert user doc:", err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      // Create/update Firestore record whenever auth state resolves to a real user
      if (user) upsertUserDoc(user);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // upsertUserDoc is called by onAuthStateChanged above
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signupWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signInWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
