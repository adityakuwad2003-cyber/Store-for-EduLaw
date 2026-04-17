import {
  collection, getDocs, addDoc, query, where,
  doc, getDoc, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface ReferralRecord {
  id: string;
  referrerUid: string;
  referrerEmail: string;
  refereeUid: string;
  refereeEmail: string;
  orderId: string;
  orderAmount: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt: any;
}

/** Get (or lazily create) a stable referral code for this user in Firestore users/{uid} */
export async function getOrCreateReferralCode(uid: string, email: string): Promise<string> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().referralCode) {
    return userSnap.data().referralCode as string;
  }

  const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${prefix}${suffix}`;

  if (userSnap.exists()) {
    await updateDoc(userRef, { referralCode: code, email });
  } else {
    await setDoc(userRef, { referralCode: code, email, uid }, { merge: true });
  }

  return code;
}

/** Look up a referrer by their referral code */
export async function findReferrerByCode(code: string): Promise<{ uid: string; email: string } | null> {
  try {
    const q = query(collection(db, 'users'), where('referralCode', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const data = snap.docs[0].data();
    return { uid: snap.docs[0].id, email: data.email || '' };
  } catch {
    return null;
  }
}

/** Get all referrals where this user is the referrer */
export async function getUserReferrals(uid: string): Promise<ReferralRecord[]> {
  try {
    const q = query(collection(db, 'referrals'), where('referrerUid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReferralRecord));
  } catch {
    return [];
  }
}

/** Save a referral record after a successful purchase */
export async function createReferral(params: {
  referrerUid: string;
  referrerEmail: string;
  refereeUid: string;
  refereeEmail: string;
  orderId: string;
  orderAmount: number;
  commissionAmount: number;
}): Promise<void> {
  await addDoc(collection(db, 'referrals'), {
    ...params,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

/** Check if this referee already has a referral record (to avoid double-credit) */
export async function hasExistingReferral(refereeUid: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'referrals'), where('refereeUid', '==', refereeUid));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
}
