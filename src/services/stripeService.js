// src/services/stripeService.js
import { doc, collection, addDoc, updateDoc, getDoc, getDocs, query, where, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Stripe integration service for handling subscriptions
 * Works with Firebase Extensions - Stripe Payments
 */

// Price IDs - these should match your Stripe products
const PRICE_IDS = {
  pro_monthly: process.env.REACT_APP_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  pro_annual: process.env.REACT_APP_STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
  premium_monthly: process.env.REACT_APP_STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
  premium_annual: process.env.REACT_APP_STRIPE_PRICE_PREMIUM_ANNUAL || 'price_premium_annual'
};

/**
 * Create a checkout session for a subscription
 * @param {string} userId - User ID
 * @param {string} plan - Plan ID ('pro' or 'premium')
 * @param {boolean} isAnnual - Whether the plan is annual
 * @param {string} successUrl - URL to redirect to after successful payment
 * @param {string} cancelUrl - URL to redirect to if checkout is cancelled
 * @returns {Promise<string>} - Checkout URL
 */
export const createCheckoutSession = async (
  userId, 
  plan, 
  isAnnual = false, 
  successUrl = window.location.origin, 
  cancelUrl = window.location.origin
) => {
  try {
    // Get the price ID for the selected plan
    const priceId = PRICE_IDS[`${plan}_${isAnnual ? 'annual' : 'monthly'}`];
    
    if (!priceId) {
      throw new Error(`Invalid plan selected: ${plan}_${isAnnual ? 'annual' : 'monthly'}`);
    }
    
    // Check if running in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('Creating checkout session in development mode');
      console.log('User ID:', userId);
      console.log('Plan:', plan);
      console.log('Annual:', isAnnual);
      console.log('Price ID:', priceId);
      
      // Return simulation URL in development
      await simulateSubscription(userId, plan, isAnnual);
      return `${window.location.origin}/account?subscription=success&simulation=true&plan=${plan}&annual=${isAnnual}`;
    }
    
    // Create checkout session document in Firestore
    // This will trigger the Stripe Firebase Extension
    const checkoutSessionRef = collection(db, 'customers', userId, 'checkout_sessions');
    
    const docRef = await addDoc(checkoutSessionRef, {
      price: priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      mode: 'subscription', // Set mode to subscription
      metadata: {
        planId: plan,
        isAnnual: isAnnual.toString()
      },
      allow_promotion_codes: true,
      tax_rates: [], // Optional: add tax rates if configured in Stripe
      created: serverTimestamp()
    });
    
    // Poll for the checkout session URL
    // The Stripe Firebase Extension will update the document with the URL
    let sessionData = null;
    let attempts = 0;
    const maxAttempts = 25;
    const delayMs = 200;
    
    while (!sessionData?.url && attempts < maxAttempts) {
      attempts++;
      
      // Get the latest document data
      const docSnap = await getDoc(docRef);
      sessionData = docSnap.data();
      
      if (sessionData?.url) break;
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    if (!sessionData?.url) {
      throw new Error('Checkout session URL not generated after multiple attempts');
    }
    
    return sessionData.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Get the user's subscription status
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Subscription status data
 */
export const getSubscriptionStatus = async (userId) => {
  try {
    // Check if running in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('Getting subscription status in development mode');
      
      // Check for simulated subscription in localStorage
      const simulatedSubscription = localStorage.getItem(`simulated_subscription_${userId}`);
      if (simulatedSubscription) {
        return JSON.parse(simulatedSubscription);
      }
      
      // Return default free status
      return { 
        active: false, 
        plan: 'free',
        subscriptionId: null,
        renewalDate: null,
        canceled: false,
        status: 'inactive'
      };
    }
    
    // First check the user document for subscription data
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // If user document has subscription data, return it
      if (userData.subscriptionId) {
        return {
          active: userData.isSubscribed || false,
          plan: userData.plan || 'free',
          subscriptionId: userData.subscriptionId,
          renewalDate: userData.subscriptionEndDate ? new Date(userData.subscriptionEndDate) : null,
          canceled: userData.subscriptionCanceled || false,
          status: userData.isSubscribed ? 'active' : 'inactive'
        };
      }
    }
    
    // Get subscriptions collection
    const subscriptionsRef = collection(db, 'customers', userId, 'subscriptions');
    const subscriptionsSnapshot = await getDocs(
      query(subscriptionsRef, where('status', 'in', ['active', 'trialing']))
    );
    
    // If no active subscriptions, return free status
    if (subscriptionsSnapshot.empty) {
      return { 
        active: false, 
        plan: 'free',
        subscriptionId: null,
        renewalDate: null,
        canceled: false,
        status: 'inactive'
      };
    }
    
    // Get the most recent active subscription
    const subscriptions = subscriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by creation date (most recent first)
    const sortedSubscriptions = subscriptions.sort((a, b) => {
      const dateA = a.created ? a.created.toDate() : new Date(0);
      const dateB = b.created ? b.created.toDate() : new Date(0);
      return dateB - dateA;
    });
    
    const latestSubscription = sortedSubscriptions[0];
    
    // Get the plan from the metadata or price product
    let plan = 'free';
    
    if (latestSubscription.metadata && latestSubscription.metadata.planId) {
      plan = latestSubscription.metadata.planId;
    } else if (latestSubscription.items && latestSubscription.items.length > 0) {
      const item = latestSubscription.items[0];
      if (item.price && item.price.product && item.price.product.metadata && item.price.product.metadata.planId) {
        plan = item.price.product.metadata.planId;
      }
    }
    
    // Get renewal date
    const renewalDate = latestSubscription.current_period_end 
      ? new Date(latestSubscription.current_period_end.seconds * 1000) 
      : null;
    
    // Update user document with subscription data
    await updateDoc(doc(db, 'users', userId), {
      isSubscribed: true,
      plan: plan,
      subscriptionId: latestSubscription.id,
      subscriptionEndDate: renewalDate ? renewalDate.toISOString() : null,
      subscriptionCanceled: latestSubscription.cancel_at_period_end || false,
      updatedAt: serverTimestamp()
    });
    
    return {
      active: true,
      plan: plan,
      subscriptionId: latestSubscription.id,
      renewalDate: renewalDate,
      canceled: latestSubscription.cancel_at_period_end || false,
      status: latestSubscription.status
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    
    // Return default status in case of error
    return { 
      active: false, 
      plan: 'free',
      subscriptionId: null,
      renewalDate: null,
      canceled: false,
      status: 'error'
    };
  }
};

/**
 * Cancel a subscription at the end of the current period
 * @param {string} userId - User ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<boolean>} - Success status
 */
export const cancelSubscription = async (userId, subscriptionId) => {
  try {
    // Check if running in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('Cancelling subscription in development mode');
      
      // Get the current simulated subscription
      const simulatedSubscriptionStr = localStorage.getItem(`simulated_subscription_${userId}`);
      if (simulatedSubscriptionStr) {
        const simulatedSubscription = JSON.parse(simulatedSubscriptionStr);
        
        // Update the subscription to be canceled
        simulatedSubscription.canceled = true;
        
        // Save back to localStorage
        localStorage.setItem(`simulated_subscription_${userId}`, JSON.stringify(simulatedSubscription));
      }
      
      return true;
    }
    
    // Create a cancel subscription document in Firestore
    // This will trigger the Stripe Firebase Extension
    const cancelRef = doc(db, 'customers', userId, 'subscriptions', subscriptionId);
    
    await updateDoc(cancelRef, {
      cancel_at_period_end: true
    });
    
    // Update user document
    await updateDoc(doc(db, 'users', userId), {
      subscriptionCanceled: true,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

/**
 * Resume a canceled subscription
 * @param {string} userId - User ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<boolean>} - Success status
 */
export const resumeSubscription = async (userId, subscriptionId) => {
  try {
    // Check if running in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('Resuming subscription in development mode');
      
      // Get the current simulated subscription
      const simulatedSubscriptionStr = localStorage.getItem(`simulated_subscription_${userId}`);
      if (simulatedSubscriptionStr) {
        const simulatedSubscription = JSON.parse(simulatedSubscriptionStr);
        
        // Update the subscription to not be canceled
        simulatedSubscription.canceled = false;
        
        // Save back to localStorage
        localStorage.setItem(`simulated_subscription_${userId}`, JSON.stringify(simulatedSubscription));
      }
      
      return true;
    }
    
    // Update the subscription document to remove cancel_at_period_end
    const cancelRef = doc(db, 'customers', userId, 'subscriptions', subscriptionId);
    
    await updateDoc(cancelRef, {
      cancel_at_period_end: false
    });
    
    // Update user document
    await updateDoc(doc(db, 'users', userId), {
      subscriptionCanceled: false,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
};

/**
 * Set up a subscription listener to receive real-time updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to call when subscription changes
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToSubscriptionChanges = (userId, callback) => {
  // Check if running in development mode
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.log('Setting up subscription listener in development mode');
    
    // In development, we'll check localStorage every 5 seconds for changes
    const interval = setInterval(() => {
      const simulatedSubscriptionStr = localStorage.getItem(`simulated_subscription_${userId}`);
      if (simulatedSubscriptionStr) {
        callback(JSON.parse(simulatedSubscriptionStr));
      }
    }, 5000);
    
    // Return unsubscribe function
    return () => clearInterval(interval);
  }
  
  // Set up a real-time listener for the subscriptions collection
  const subscriptionsRef = collection(db, 'customers', userId, 'subscriptions');
  const q = query(subscriptionsRef, where('status', 'in', ['active', 'trialing', 'canceled']));
  
  // Subscribe to changes
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      callback({ 
        active: false, 
        plan: 'free',
        subscriptionId: null,
        renewalDate: null,
        canceled: false,
        status: 'inactive'
      });
      return;
    }
    
    // Get the most recent subscription
    const subscriptions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by creation date (most recent first)
    const sortedSubscriptions = subscriptions.sort((a, b) => {
      const dateA = a.created ? a.created.toDate() : new Date(0);
      const dateB = b.created ? b.created.toDate() : new Date(0);
      return dateB - dateA;
    });
    
    const latestSubscription = sortedSubscriptions[0];
    
    // Get the plan from the metadata or price product
    let plan = 'free';
    
    if (latestSubscription.metadata && latestSubscription.metadata.planId) {
      plan = latestSubscription.metadata.planId;
    } else if (latestSubscription.items && latestSubscription.items.length > 0) {
      const item = latestSubscription.items[0];
      if (item.price && item.price.product && item.price.product.metadata && item.price.product.metadata.planId) {
        plan = item.price.product.metadata.planId;
      }
    }
    
    // Get renewal date
    const renewalDate = latestSubscription.current_period_end 
      ? new Date(latestSubscription.current_period_end.seconds * 1000) 
      : null;
    
    // Update user document with subscription data
    try {
      await updateDoc(doc(db, 'users', userId), {
        isSubscribed: latestSubscription.status === 'active' || latestSubscription.status === 'trialing',
        plan: plan,
        subscriptionId: latestSubscription.id,
        subscriptionEndDate: renewalDate ? renewalDate.toISOString() : null,
        subscriptionCanceled: latestSubscription.cancel_at_period_end || false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user document:', error);
    }
    
    callback({
      active: latestSubscription.status === 'active' || latestSubscription.status === 'trialing',
      plan: plan,
      subscriptionId: latestSubscription.id,
      renewalDate: renewalDate,
      canceled: latestSubscription.cancel_at_period_end || false,
      status: latestSubscription.status
    });
  }, (error) => {
    console.error('Error in subscription listener:', error);
    callback({ 
      active: false, 
      plan: 'free',
      subscriptionId: null,
      renewalDate: null,
      canceled: false,
      status: 'error'
    });
  });
  
  return unsubscribe;
};

/**
 * Simulate a subscription for development purposes
 * @param {string} userId - User ID
 * @param {string} planId - Plan ID ('pro' or 'premium')
 * @param {boolean} isAnnual - Whether it's an annual subscription
 * @returns {Promise<boolean>} - Success status
 */
export const simulateSubscription = async (userId, planId, isAnnual = false) => {
  try {
    // Only available in development mode
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Simulation is only available in development mode');
      return false;
    }
    
    // Create a simulated subscription
    const now = new Date();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    
    const renewalDate = new Date(now.getTime() + (isAnnual ? oneYear : oneMonth));
    
    const simulatedSubscription = {
      active: true,
      plan: planId,
      renewalDate,
      canceled: false,
      subscriptionId: `sim_${Date.now()}`,
      isAnnual,
      status: 'active'
    };
    
    // Save to localStorage
    localStorage.setItem(`simulated_subscription_${userId}`, JSON.stringify(simulatedSubscription));
    
    // Also update the user document if using Firebase
    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          plan: planId,
          isSubscribed: true,
          subscriptionEndDate: renewalDate.toISOString(),
          subscriptionCanceled: false,
          subscriptionId: simulatedSubscription.subscriptionId,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating user document:', error);
        // Continue even if this fails
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error simulating subscription:', error);
    return false;
  }
};