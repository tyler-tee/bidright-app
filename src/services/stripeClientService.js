// src/services/stripeClientService.js
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * Stripe client-side integration service
 */

/**
 * Get the Stripe instance
 * @returns {Promise<Stripe>} - The Stripe instance
 */
export const getStripe = async () => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }
    return stripe;
  } catch (error) {
    console.error('Error getting Stripe instance:', error);
    throw error;
  }
};

/**
 * Redirect to Stripe Checkout
 * @param {string} sessionUrl - Checkout session URL
 * @returns {Promise<void>}
 */
export const redirectToCheckout = async (sessionUrl) => {
  try {
    // If given a full URL, redirect directly
    if (sessionUrl.startsWith('http')) {
      window.location.href = sessionUrl;
      return;
    }
    
    // Otherwise, assume it's a session ID and use Stripe's redirect
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionUrl
    });
    
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

/**
 * Handle stripe callback from successful checkout
 * @param {string} sessionId - Checkout session ID from URL
 * @returns {Promise<Object>} - Session data
 */
export const handleCheckoutSuccess = async (sessionId) => {
  try {
    // In a real implementation, you'd validate the session with your backend
    // Here we'll just log for development purposes
    console.log('Successful checkout with session ID:', sessionId);
    
    // Return a simulated session object
    return {
      status: 'success',
      sessionId,
      paymentStatus: 'paid',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error handling checkout success:', error);
    throw error;
  }
};

/**
 * Handle stripe callback from canceled checkout
 * @returns {Object} - Canceled status
 */
export const handleCheckoutCanceled = () => {
  // Just return a canceled status object
  return {
    status: 'canceled',
    timestamp: new Date().toISOString()
  };
};

/**
 * Convert URL query parameters to an object
 * @returns {Object} - Query parameters as object
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

/**
 * Check if the current page is a Stripe callback
 * @returns {Object|null} - Callback data or null if not a callback
 */
export const checkForStripeCallback = () => {
  const params = getQueryParams();
  
  if (params.subscription === 'success' && params.session_id) {
    return {
      type: 'success',
      sessionId: params.session_id
    };
  }
  
  if (params.subscription === 'canceled') {
    return {
      type: 'canceled'
    };
  }
  
  if (params.subscription === 'success' && params.simulation === 'true') {
    return {
      type: 'simulation',
      plan: params.plan || 'pro',
      annual: params.annual === 'true'
    };
  }
  
  return null;
};