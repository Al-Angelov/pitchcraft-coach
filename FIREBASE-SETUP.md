# Firebase Setup — Auth & Credit Tracking

PitchCraft uses **Firebase Authentication** and **Cloud Firestore** to gate the
Stage (AI Pitch Coach) behind a free account and track 15 free session credits
per user.

The Navigator, Library, and Archetypes tabs remain fully public — no login required.

---

## 1. Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Click **Add project**, name it (e.g. `pitchcraft-coach`), and finish setup.
3. In the project, click the **Web** icon (`</>`) to register a web app.
4. Copy the `firebaseConfig` object it gives you.

## 2. Enable Authentication

1. In the Firebase console, go to **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable:
   - **Email/Password**
   - **Google** (optional but recommended)
3. If you deploy to Vercel, add your production domain under
   **Authentication → Settings → Authorized domains**
   (e.g. `pitchcraft-coach.vercel.app`).

## 3. Create the Firestore Database

1. Go to **Build → Firestore Database → Create database**.
2. Start in **production mode**.
3. Choose a region close to your users.

The app automatically creates a document in the `users` collection for each new
user on first sign-in:

```
users/{uid}
  ├── email:     "user@example.com"
  ├── credits:   15
  └── createdAt: "2026-08-06T14:30:00Z"
```

## 4. Firestore Security Rules

Paste these rules under **Firestore Database → Rules**. They ensure a user can
only read and modify their own document, and can never grant themselves more
than the starting credits:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;

      // Allow creating own doc with exactly 15 starting credits
      allow create: if request.auth != null
                    && request.auth.uid == uid
                    && request.resource.data.credits == 15;

      // Allow updates that only decrease credits (never increase)
      allow update: if request.auth != null
                    && request.auth.uid == uid
                    && request.resource.data.credits <= resource.data.credits;
    }
  }
}
```

> Note: For stronger protection against client tampering, move credit deduction
> to a serverless function (e.g. a Vercel `/api/deduct-credit` route using the
> Firebase Admin SDK). The client-side rules above are sufficient for a beta.

## 5. Add Your Config to the App

Firebase is initialized in a dedicated file: **`js/config/firebase.js`**.
Replace the `firebaseConfig` object there with your project's values:

```javascript
// js/config/firebase.js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "pitchcraft-coach.firebaseapp.com",
  projectId: "pitchcraft-coach",
  storageBucket: "pitchcraft-coach.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

This file initializes the Firebase App, Auth, and Firestore, and exports the
`auth` and `db` instances that `FirebaseService.js` consumes.

> The Firebase web API key is **not secret** — it identifies your project and is
> safe to expose in client code. Security is enforced by the Firestore rules and
> Authentication settings above, not by hiding the key.

## 6. Local Development

If the Firebase instances fail to initialize (e.g. invalid config), the app
**gracefully degrades**: the Stage stays unlocked and no credit tracking occurs,
so you can still develop locally. Configure `js/config/firebase.js` when you're
ready to test the full auth + credit flow.

## 7. How Credits Work

- **New user** → Firestore doc created with `credits: 15`.
- **Start session** → blocked unless signed in AND `credits > 0`.
- **Session transcribed successfully** → `credits` decremented by 1 (atomic).
- **Status bar** (bottom-left) shows `Sessions Remaining: N / 15`, updating live
  via a Firestore `onSnapshot` listener.
- **0 credits** → Start button disabled + "out of free sessions" message.
