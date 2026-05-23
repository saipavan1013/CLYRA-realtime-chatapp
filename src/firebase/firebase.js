import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * The Firebase App instance.
 * @type {import('firebase/app').FirebaseApp}
 */
const app = initializeApp(firebaseConfig);

/**
 * The Firebase Auth instance.
 * @type {import('firebase/auth').Auth}
 */
export const auth = getAuth(app);

/**
 * The Firestore Database instance.
 * @type {import('firebase/firestore').Firestore}
 */
export const db = getFirestore(app);

/**
 * The Firebase Storage instance.
 * @type {import('firebase/storage').FirebaseStorage}
 */
export const storage = getStorage(app);
