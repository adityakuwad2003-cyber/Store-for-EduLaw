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
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface UserSubscription {
  planId: string;   // 'pro' | 'max' | any legacy value
  status: 'active' | 'expired' | 'none';
  expiresAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  subscription: UserSubscription | null;
  isSubscribed: boolean;        // true if subscription.status === 'active'
  isPro: boolean;               // planId === 'pro' && active
  isMax: boolean;               // planId === 'max' && active
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
      },
      { merge: true }
    );
    await setDoc(
      doc(db, "users", user.uid),
      { createdAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn("Could not upsert user doc:", err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) upsertUserDoc(user);
      else setSubscription(null);
    });
    return unsubscribeAuth;
  }, []);

  // Subscription listener — real-time Firestore watch on users/{uid}
  useEffect(() => {
    if (!currentUser) { setSubscription(null); return; }
    const unsubDoc = onSnapshot(
      doc(db, "users", currentUser.uid),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const sub = data?.subscription ?? null;
        if (sub && typeof sub === "object") {
          setSubscription(sub as UserSubscription);
        } else {
          setSubscription(null);
        }
      },
      () => setSubscription(null) // silently handle permission errors
    );
    return unsubDoc;
  }, [currentUser]);

  const isActive = subscription?.status === "active";
  const isSubscribed = isActive;
  const isPro = isActive && subscription?.planId === "pro";
  const isMax = isActive && subscription?.planId === "max";

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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
    subscription,
    isSubscribed,
    isPro,
    isMax,
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
