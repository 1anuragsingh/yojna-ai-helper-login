import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Debug: Log environment variables
console.log('Firebase Config Loading...');
console.log('API Key exists:', !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration incomplete:', firebaseConfig);
  throw new Error('Firebase credentials are missing. Check .env.local file.');
}

console.log('✅ Firebase config valid');

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');
  
  // Enable session persistence
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error('Warning: Could not set persistence:', error);
    });
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error);
  // Don't throw, allow the app to continue with error state
}

export { app, auth };
export default app;
