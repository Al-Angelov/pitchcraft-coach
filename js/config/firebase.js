// js/config/firebase.js
// Dedicated Firebase initialization — creates the App, Auth, and Firestore
// instances used across the app. Import { auth, db } (or firebaseApp) from here.
//
// Config is read from Vite environment variables (VITE_FIREBASE_*), defined in
// a local .env file (see .env.example) and injected at build time by Vite.
//
// NOTE: The Firebase web API key is NOT a secret — it identifies the project and
// is safe to ship in client code. Access is controlled by Firebase Auth settings
// and Firestore security rules, not by hiding this key.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseApp, auth, db, firebaseConfig };
