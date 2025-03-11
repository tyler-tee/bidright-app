// src/components/subscription/StripeCheckoutButton.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePremiumFeatures } from '../../contexts/PremiumFeaturesContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * A button component that initiates a Stripe checkout session
 */
const StripeCheckoutButton = ({
  plan,
  isAnnual = false,
  className = '',
  buttonText,
  loadingText = 'Processing...',
  successUrl,
  cancelUrl,
  onCheckoutStarted,
  onCheckoutError,
  disabled = false,
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline'
  size = 'md', // 'sm', 'md', 'lg'
  trackEvent
}) => {
  const { currentUser } = useAuth();
  const { getCurrentPlan } = usePremiumFeatures();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get current plan to check if it's the same as selected
  const currentPlan = getCurrentPlan();
  const isCurrentPlan = currentPlan === plan;
  
  // Handle checkout button click
  const handleCheckout = async () => {
    // If already subscribed to this plan, do nothing
    if (isCurrentPlan && currentUser) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Track event if tracking function provided
      if (trackEvent) {
        trackEvent('checkout_started', {
          plan,
          billing_cycle: isAnnual ? 'annual' : 'monthly'
        });
      }
      
      // Call onCheckoutStarted callback if provided
      if (onCheckoutStarted) {
        onCheckoutStarted();
      }
      
      // If not logged in, handle accordingly (could redirect to login)
      if (!currentUser) {
        // Redirect to signup with a return path
        window.location.href = `/signup?returnTo=${encodeURIComponent(window.location.pathname)}&plan=${plan}&billing=${isAnnual ? 'annual' : 'monthly'}`;
        return;
      }
      
      // Get Firebase Functions
      const functions = getFunctions();
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      
      // Call the Firebase function to create a checkout session
      const result = await createCheckoutSession({
        plan,
        isAnnual,
        successUrl,
        cancelUrl
      });
      
      // Get the checkout URL from the response
      const { url } = result.data;
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error starting checkout:', error);
      setError(error.message || 'Failed to start checkout process');
      
      // Call onCheckoutError callback if provided
      if (onCheckoutError) {
        onCheckoutError(error);
      }
      
      // Track error event if tracking function provided
      if (trackEvent) {
        trackEvent('checkout_error', {
          plan,
          billing_cycle: isAnnual ? 'annual' : 'monthly',
          error: error.message
        });
      }
      
      setIsLoading(false);
    }
  };
  
  // Determine button styles based on variant
  let buttonStyle = '';
  
  switch (variant) {
    case 'primary':
      buttonStyle = 'bg-blue-600 hover:bg-blue-700 text-white';
      break;
    case 'secondary':
      buttonStyle = 'bg-purple-600 hover:bg-purple-700 text-white';
      break;
    case 'outline':
      buttonStyle = 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50';
      break;
    default:
      buttonStyle = 'bg-blue-600 hover:bg-blue-700 text-white';
  }
  
  // Determine button size
  let buttonSize = '';
  
  switch (size) {
    case 'sm':
      buttonSize = 'py-1 px-3 text-sm';
      break;
    case 'md':
      buttonSize = 'py-2 px-4';
      break;
    case 'lg':
      buttonSize = 'py-3 px-6 text-lg';
      break;
    default:
      buttonSize = 'py-2 px-4';
  }
  
  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={isLoading || disabled || isCurrentPlan}
        className={`
          ${buttonStyle}
          ${buttonSize}
          font-medium rounded-lg transition-colors
          ${isLoading || disabled || isCurrentPlan ? 'opacity-70 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {loadingText}
          </>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : children || buttonText || 'Subscribe'}
      </button>

      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default StripeCheckoutButton;