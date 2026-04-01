/**
 * Shared Firebase Admin SDK initializer — lazy, never throws at module load.
 * All API routes import adminDb / adminAuth from here.
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getApp() {
  if (getApps().length > 0) return getApps()[0];

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw Object.assign(
      new Error("Server configuration error. Please contact support."),
      { status: 503 }
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

// Lazy getters — Firebase is only initialised when first used inside a handler,
// never at module-load time.  Any error thrown here is caught by the handler's
// try/catch and returned as a proper JSON response.
export const adminAuth = {
  verifyIdToken: (token: string) => getAuth(getApp()).verifyIdToken(token),
};

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop) {
    const db = getFirestore(getApp());
    const value = (db as any)[prop];
    return typeof value === "function" ? value.bind(db) : value;
  },
});
