// js/config/firebase.js
// Dedicated Firebase initialization — creates the App, Auth, and Firestore
// instances used across the app. Import { auth, db } (or firebaseApp) from here.
//
// Uses the Firebase v10 modular SDK loaded from the official CDN via ES modules.
//
// NOTE: The Firebase web API key is NOT a secret — it identifies the project and
// is safe to ship in client code. Access is controlled by Firebase Auth settings
// and Firestore security rules, not by hiding this key.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCrv6efd0E76wCDeU8SXYVmtvDrFy07NdY',
  authDomain: 'pitchcraft-coach.firebaseapp.com',
  projectId: 'pitchcraft-coach',
  storageBucket: 'pitchcraft-coach.firebasestorage.app',
  messagingSenderId: '408778304783',
  appId: '1:408778304783:web:4fcbbcdcbd082775fc227a'
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize and export the services the app uses
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseApp, auth, db, firebaseConfig };
