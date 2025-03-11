// src/components/subscription/CustomerPortalButton.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Button component that redirects to Stripe Customer Portal
 */
const CustomerPortalButton = ({ 
  className = '', 
  buttonText = 'Manage Subscription', 
  disabled = false,
  trackEvent
}) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handlePortalRedirect = async () => {
    if (!currentUser) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Track the event
      if (trackEvent) {
        trackEvent('customer_portal_clicked');
      }
      
      // Get Firebase Functions
      const functions = getFunctions();
      const createCustomerPortalSession = httpsCallable(functions, 'createCustomerPortalSession');
      
      // Call the Firebase function to create a portal session
      const result = await createCustomerPortalSession({
        returnUrl: window.location.origin + '/subscription'
      });
      
      // Get the portal URL from the response
      const { url } = result.data;
      
      // Redirect to the customer portal
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
      setError('Could not open customer portal. Please try again later.');
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <button
        onClick={handlePortalRedirect}
        disabled={isLoading || disabled || !currentUser}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${
          isLoading || disabled ? 'opacity-70 cursor-not-allowed' : ''
        } ${className}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : buttonText}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </>
  );
};

export default CustomerPortalButton;