// src/components/auth/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A component wrapper that requires authentication to access content
 * 
 * @param {Object} props
 * @param {Function} props.setView - Function to navigate to a different view
 * @param {string} props.currentView - Current view name
 * @param {Component} props.component - Component to render if authenticated
 * @param {Object} props.componentProps - Props to pass to the protected component
 */
const ProtectedRoute = ({ setView, currentView, component: Component, componentProps = {} }) => {
  const { currentUser, loading } = useAuth();

  // Show loading state while auth state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!currentUser) {
    // Optionally, we could store the intended destination for post-login redirect
    localStorage.setItem('redirectAfterLogin', currentView);
    
    // Redirect to login
    if (currentView !== 'login') {
      setView('login');
    }
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mx-auto max-w-md my-8">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // If user is logged in, render the protected component
  return <Component {...componentProps} />;
};

export default ProtectedRoute;