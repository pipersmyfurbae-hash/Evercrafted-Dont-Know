import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read from Vite's import.meta.env in the browser build, falling back to
// process.env so the same module also works when scripts run under plain
// Node/tsx (e.g. scripts/test-moodoor-matching.integration.ts), where
// import.meta.env is never populated.
function envVar(name: string): string | undefined {
  return (import.meta as { env?: Record<string, string> }).env?.[name] ?? process.env[name];
}

const firebaseConfig = {
  apiKey: envVar('VITE_FIREBASE_API_KEY'),
  authDomain: envVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: envVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: envVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: envVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: envVar('VITE_FIREBASE_APP_ID'),
};

const firestoreDatabaseId = envVar('VITE_FIREBASE_FIRESTORE_DATABASE_ID');

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firestoreDatabaseId);
export const storage = getStorage(app);
