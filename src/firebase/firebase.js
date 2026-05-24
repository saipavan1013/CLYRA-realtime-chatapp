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

let app = null;
let auth = null;
let db = null;
let storage = null;

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
];

const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);

if (missingKeys.length > 0) {
  const errorMsg = `Missing critical environment variables: ${missingKeys.join(', ')}. Please configure your .env file correctly.`;
  console.error('[Firebase Init Error]', errorMsg);
  window.__firebaseConfigError = errorMsg;
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    const initErrorMsg = `Firebase failed to initialize: ${error.message || error}`;
    console.error('[Firebase Init Exception]', error);
    window.__firebaseConfigError = initErrorMsg;
  }
}

export { auth, db, storage };

