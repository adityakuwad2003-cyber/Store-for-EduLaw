import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace these with the keys from your Firebase Console
// 1. Go to https://console.firebase.google.com/
// 2. Click "Add Project"
// 3. Click the Web (</>) icon to add an app
// 4. Copy the keys below into this configuration block
const firebaseConfig = {
  apiKey: "AIzaSyBhGDlwzOIGavd1m4P8Ws8ftJsJ2m9hak8",
  authDomain: "edulaw-3b674.firebaseapp.com",
  projectId: "edulaw-3b674",
  storageBucket: "edulaw-3b674.firebasestorage.app",
  messagingSenderId: "249962949619",
  appId: "1:249962949619:web:e3bbe829ca6478131cc086"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
