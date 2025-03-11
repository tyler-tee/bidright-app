// src/components/subscription/StripeCallbackHandler.js
import { useEffect, useState } from 'react';
import { checkForStripeCallback, handleCheckoutSuccess, handleCheckoutCanceled } from '../../services/stripeClientService';
import { getSubscriptionStatus, simulateSubscription } from '../../services/stripeService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component to handle Stripe callbacks
 * Mount this in routes that might receive callbacks from Stripe
 */
const StripeCallbackHandler = ({ onSuccess, onError, trackEvent }) => {
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Only proceed if we haven't already processed this callback
      if (processed || isProcessing || !currentUser) return;
      
      const callback = checkForStripeCallback();
      if (!callback) return;
      
      setIsProcessing(true);
      
      try {
        if (callback.type === 'success' && callback.sessionId) {
          // Handle successful checkout
          await handleCheckoutSuccess(callback.sessionId);
          
          // Refresh subscription status
          const status = await getSubscriptionStatus(currentUser.uid);
          
          // Track event
          if (trackEvent) {
            trackEvent('subscription_checkout_completed', {
              plan: status.plan,
              billing_cycle: status.isAnnual ? 'annual' : 'monthly'
            });
          }
          
          // Call success callback
          if (onSuccess) {
            onSuccess(status);
          }
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } 
        else if (callback.type === 'canceled') {
          // Handle canceled checkout
          handleCheckoutCanceled();
          
          // Track event
          if (trackEvent) {
            trackEvent('subscription_checkout_canceled');
          }
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        else if (callback.type === 'simulation') {
          // Handle simulation (development only)
          if (process.env.NODE_ENV === 'development') {
            await simulateSubscription(
              currentUser.uid,
              callback.plan,
              callback.annual
            );
            
            // Refresh subscription status
            const status = await getSubscriptionStatus(currentUser.uid);
            
            // Track event
            if (trackEvent) {
              trackEvent('subscription_simulation_completed', {
                plan: callback.plan,
                billing_cycle: callback.annual ? 'annual' : 'monthly'
              });
            }
            
            // Call success callback
            if (onSuccess) {
              onSuccess(status);
            }
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (error) {
        console.error('Error handling Stripe callback:', error);
        
        // Track error
        if (trackEvent) {
          trackEvent('subscription_callback_error', {
            error: error.message
          });
        }
        
        // Call error callback
        if (onError) {
          onError(error);
        }
      } finally {
        setIsProcessing(false);
        setProcessed(true);
      }
    };
    
    handleCallback();
  }, [currentUser, onSuccess, onError, trackEvent, processed, isProcessing]);

  // This component doesn't render anything
  return null;
};

export default StripeCallbackHandler;