// src/firebase/validateEnv.js
export function validateFirebaseConfig() {
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