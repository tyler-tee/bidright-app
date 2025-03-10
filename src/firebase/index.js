// src/firebase/index.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Validate environment variables
function validateFirebaseConfig() {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    const missingVarsString = missingVars.join(', ');
    
    if (process.env.NODE_ENV === 'production') {
      console.error(`Missing required Firebase environment variables: ${missingVarsString}`);
      return false;
    } else {
      console.warn(`Missing Firebase environment variables: ${missingVarsString}`);
      console.warn('Make sure to create a .env.local file with these variables for local development.');
      return false;
    }
  }
  
  return true;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
let app, auth, db, googleProvider;

try {
  // Validate config before initializing
  const isConfigValid = validateFirebaseConfig();
  
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  
  if (isConfigValid) {
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase initialized with incomplete config');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { auth, db, googleProvider };