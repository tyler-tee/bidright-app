// src/services/subscription.js
import { doc, updateDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Create a checkout session with Stripe
 * @param {string} userId - User ID 
 * @param {string} planId - Plan ID (e.g., 'pro', 'premium')
 * @param {boolean} isAnnual - Whether it's an annual subscription
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect after cancelled payment
 * @returns {Promise<string>} Checkout URL
 */
export const createCheckoutSession = async (
  userId, 
  planId, 
  isAnnual = false, 
  successUrl = window.location.origin, 
  cancelUrl = window.location.origin
) => {
  try {
    // Check if we're in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('Creating checkout session in development mode');
      console.log('User ID:', userId);
      console.log('Plan ID:', planId);
      console.log('Annual:', isAnnual);
      
      // Return a simulated checkout URL in development
      return `${window.location.origin}/account?simulation=true&plan=${planId}&annual=${isAnnual}`;
    }
    
    // Create a reference to the checkout_sessions collection
    const checkoutSessionRef = collection(db, 'customers', userId, 'checkout_sessions');
    
    // Add a new document with the checkout data
    const docRef = await addDoc(checkoutSessionRef, {
      price: `price_${planId}_${isAnnual ? 'annual' : 'monthly'}`, // This should match your Stripe price IDs
      success_url: successUrl,
      cancel_url: cancelUrl,
      created: serverTimestamp()
    });
    
    // Wait for the checkout session to be created by the Cloud Function
    const checkoutSessionDoc = await getDoc(docRef);
    
    // Poll for the URL
    let sessionData = checkoutSessionDoc.data();
    let attempts = 0;
    
    // Try to get the URL for up to 20 attempts (with sleep between attempts)
    while (!sessionData?.url && attempts < 20) {
      attempts++;
      await new Promise(r => setTimeout(r, 200)); // Sleep for 200ms
      const latestDoc = await getDoc(docRef);
      sessionData = latestDoc.data();
    }
    
    if (sessionData?.url) {
      return sessionData.url;
    } else {
      throw new Error("Checkout session creation timed out");
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

/**
 * Get the current subscription status for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription data
 */
export const getSubscriptionStatus = async (userId) => {
  try {
    // Check if we're in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('Getting subscription status in development mode');
      
      // Check if there's a simulated subscription in localStorage
      const simulatedSubscription = localStorage.getItem(`simulated_subscription_${userId}`);
      if (simulatedSubscription) {
        return JSON.parse(simulatedSubscription);
      }
      
      // Return default free plan status
      return { active: false, plan: 'free' };
    }
    
    // Get user document to check if there's a plan field
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists() && userDoc.data().plan) {
      const userData = userDoc.data();
      
      // If user document has plan information, use that
      return {
        active: userData.isSubscribed || userData.plan !== 'free',
        plan: userData.plan || 'free',
        renewalDate: userData.subscriptionEndDate ? new Date(userData.subscriptionEndDate) : null,
        canceled: userData.subscriptionCanceled || false,
        subscriptionId: userData.subscriptionId || null
      };
    }
    
    // If no subscription info in user document, check subscriptions subcollection
    const subscriptionsRef = collection(db, 'customers', userId, 'subscriptions');
    const subscriptionsSnapshot = await getDoc(subscriptionsRef);
    
    if (subscriptionsSnapshot.empty) {
      return { active: false, plan: 'free' };
    }
    
    // Get the most recent subscription document
    const subscriptionDocs = subscriptionsSnapshot.docs;
    const sortedDocs = subscriptionDocs.sort((a, b) => 
      b.data().created.toDate() - a.data().created.toDate()
    );
    
    const latestSubscription = sortedDocs[0].data();
    
    return {
      active: latestSubscription.status === 'active',
      plan: latestSubscription.price?.product?.metadata?.plan || 'free',
      renewalDate: latestSubscription.current_period_end?.toDate(),
      canceled: latestSubscription.cancel_at_period_end || false,
      subscriptionId: sortedDocs[0].id
    };
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return { active: false, plan: 'free' };
  }
};

/**
 * Cancel a subscription at the period end
 * @param {string} userId - User ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<boolean>} Success status
 */
export const cancelSubscription = async (userId, subscriptionId) => {
  try {
    // Check if we're in development mode
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
    
    // Handle cancellation in production
    // First check if the subscription exists in the user document
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists() && userDoc.data().subscriptionId) {
      // Update the user document
      await updateDoc(doc(db, 'users', userId), {
        subscriptionCanceled: true
      });
    }
    
    // Also update the subscription document if it exists
    if (subscriptionId) {
      const cancelRef = doc(db, 'customers', userId, 'subscriptions', subscriptionId);
      
      // This assumes you have a Cloud Function that handles the actual cancellation
      await updateDoc(cancelRef, {
        cancel_at_period_end: true
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
};

/**
 * Simulate a subscription for development purposes
 * @param {string} userId - User ID
 * @param {string} planId - Plan ID ('pro' or 'premium')
 * @param {boolean} isAnnual - Whether it's an annual subscription
 * @returns {Promise<boolean>} Success status
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
      isAnnual
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
          subscriptionId: simulatedSubscription.subscriptionId
        });
      } catch (error) {
        console.error('Error updating user document:', error);
        // Continue even if this fails
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error simulating subscription:", error);
    return false;
  }
};