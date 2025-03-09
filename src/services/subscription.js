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
      plan: latestSubscription.price.product.metadata.plan || 'free',
      renewalDate: latestSubscription.current_period_end.toDate(),
      canceled: latestSubscription.cancel_at_period_end,
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
    const cancelRef = doc(db, 'customers', userId, 'subscriptions', subscriptionId);
    
    // This assumes you have a Cloud Function that handles the actual cancellation
    await updateDoc(cancelRef, {
      cancel_at_period_end: true
    });
    
    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
};

/**
 * Update the subscription plan
 * @param {string} userId - User ID
 * @param {string} subscriptionId - Subscription ID
 * @param {string} newPlanId - New plan ID
 * @param {boolean} isAnnual - Whether it's an annual plan
 * @returns {Promise<string>} Checkout URL for the plan change
 */
export const updateSubscription = async (
  userId, 
  subscriptionId, 
  newPlanId, 
  isAnnual = false
) => {
  try {
    // For simplicity, we'll just create a new checkout session for now
    // In a production app, you'd want to use Stripe's update subscription API
    return await createCheckoutSession(
      userId, 
      newPlanId, 
      isAnnual, 
      `${window.location.origin}/account?upgrade=success`, 
      `${window.location.origin}/account?upgrade=canceled`
    );
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};