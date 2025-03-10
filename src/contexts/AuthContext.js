// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sign up function
  async function signup(email, password, displayName) {
    try {
      setError('');
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName,
        createdAt: serverTimestamp(),
        isSubscribed: false,
        plan: 'free',
        role: 'user',
        estimateCount: 0,
        lastLogin: serverTimestamp()
      });
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      const userRef = doc(db, 'users', userCredential.user.uid);
      await updateDoc(userRef, { 
        lastLogin: serverTimestamp() 
      });
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Google sign-in
  async function signInWithGoogle() {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists, create if not
      const userDoc = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userDoc);
      
      if (!docSnap.exists()) {
        // Create new user document
        await setDoc(userDoc, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          isSubscribed: false,
          plan: 'free',
          role: 'user',
          estimateCount: 0,
          lastLogin: serverTimestamp()
        });
      } else {
        // Update last login timestamp
        await updateDoc(userDoc, { 
          lastLogin: serverTimestamp() 
        });
      }
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Logout function
  function logout() {
    setError('');
    return signOut(auth);
  }

  // Reset password
  function resetPassword(email) {
    setError('');
    return sendPasswordResetEmail(auth, email);
  }

  // Fetch user details from Firestore
  async function fetchUserDetails(uid) {
    try {
      setError('');
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserDetails(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user profile");
      return null;
    }
  }

  // Update user profile
  async function updateUserProfile(uid, data) {
    try {
      setError('');
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      // If display name is being updated, also update in auth
      if (data.displayName && currentUser) {
        await updateProfile(currentUser, { displayName: data.displayName });
      }
      
      // Refresh user details
      return await fetchUserDetails(uid);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
      throw error;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          await fetchUserDetails(user.uid);
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      } else {
        setUserDetails(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDetails,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    fetchUserDetails,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}