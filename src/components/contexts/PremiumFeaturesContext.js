// src/contexts/PremiumFeaturesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSubscriptionStatus, subscribeToSubscriptionChanges } from '../services/stripeService';

// Define the feature access by plan
const FEATURE_ACCESS = {
  // Free plan features
  free: [
    'basic_estimation',
    'save_estimates_limited',  // Up to 3 estimates
    'export_basic'             // Basic text export
  ],
  
  // Pro plan features
  pro: [
    'basic_estimation',
    'save_estimates_unlimited',
    'export_pdf',              // PDF export
    'project_breakdown',       // Detailed project breakdown
    'risk_assessment',         // Project risk assessment
    'custom_branding',         // Add your own branding to exports
    'white_label',             // Remove BidRight branding
    'profitability_analysis',  // Project profitability calculator
    'client_management',       // Manage clients
    'contract_templates',      // Contract templates
    'priority_support'         // Priority email support
  ]
};

// Create the context
const PremiumFeaturesContext = createContext();

// Export the context hook
export const usePremiumFeatures = () => useContext(PremiumFeaturesContext);

// Provider component
export function PremiumFeaturesProvider({ children }) {
  const { currentUser } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the user's subscription status on mount and when user changes
  useEffect(() => {
    let unsubscribe = () => {};
    
    const fetchSubscriptionStatus = async () => {
      if (!currentUser) {
        setSubscriptionStatus(null);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get initial subscription status
        const status = await getSubscriptionStatus(currentUser.uid);
        setSubscriptionStatus(status);
        setIsLoading(false);
        
        // Set up real-time listener for subscription changes
        unsubscribe = subscribeToSubscriptionChanges(currentUser.uid, (newStatus) => {
          setSubscriptionStatus(newStatus);
        });
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setError('Failed to load subscription status');
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionStatus();
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);
  
  // Helper function to check if user has a specific plan
  const hasPlan = (planName) => {
    if (!subscriptionStatus) return planName === 'free';
    
    // If user has a subscription, check if it's active and matches the plan
    const isActive = subscriptionStatus.active;
    const currentPlan = subscriptionStatus.plan;
    
    if (!isActive) return planName === 'free';
    
    // Plan hierarchy: free < pro
    const planHierarchy = { free: 1, pro: 2 };
    
    // User has access to the plan if their current plan is the same or higher level
    return planHierarchy[currentPlan] >= planHierarchy[planName];
  };
  
  // Check if user has access to a specific feature
  const hasFeature = (featureName) => {
    if (!subscriptionStatus) return FEATURE_ACCESS.free.includes(featureName);
    
    // Get the user's current plan
    const currentPlan = subscriptionStatus.active ? subscriptionStatus.plan : 'free';
    
    // Check if the feature is included in the user's plan
    return FEATURE_ACCESS[currentPlan]?.includes(featureName) || false;
  };
  
  // Check if user can save more estimates
  const canSaveMoreEstimates = (currentEstimateCount) => {
    // Pro users have unlimited estimates
    if (hasPlan('pro')) return true;
    
    // Free users are limited to 3 estimates
    const MAX_FREE_ESTIMATES = 3;
    return currentEstimateCount < MAX_FREE_ESTIMATES;
  };
  
  // Get the remaining free estimates
  const getRemainingFreeEstimates = (currentEstimateCount) => {
    if (hasPlan('pro')) return Infinity;
    
    const MAX_FREE_ESTIMATES = 3;
    return Math.max(0, MAX_FREE_ESTIMATES - currentEstimateCount);
  };
  
  // Check if user has a canceled subscription
  const hasActivePlan = () => {
    if (!subscriptionStatus) return false;
    return subscriptionStatus.active && !subscriptionStatus.canceled;
  };
  
  // Check if user has a canceled subscription
  const hasCanceledPlan = () => {
    if (!subscriptionStatus) return false;
    return subscriptionStatus.active && subscriptionStatus.canceled;
  };
  
  // Get the user's current plan
  const getCurrentPlan = () => {
    if (!subscriptionStatus || !subscriptionStatus.active) return 'free';
    return subscriptionStatus.plan;
  };
  
  // Get the subscription renewal date
  const getRenewalDate = () => {
    if (!subscriptionStatus || !subscriptionStatus.renewalDate) return null;
    return subscriptionStatus.renewalDate;
  };
  
  // Get the subscription ID
  const getSubscriptionId = () => {
    if (!subscriptionStatus) return null;
    return subscriptionStatus.subscriptionId;
  };
  
  // Format subscription details for display
  const getSubscriptionDetails = () => {
    if (!subscriptionStatus) {
      return {
        plan: 'free',
        status: 'Free Plan',
        renewalText: '',
        isActive: false,
        isCanceled: false
      };
    }
    
    const plan = subscriptionStatus.active ? subscriptionStatus.plan : 'free';
    const planDisplay = plan === 'pro' ? 'Pro Plan' : 'Free Plan';
    
    let renewalText = '';
    if (subscriptionStatus.renewalDate) {
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = subscriptionStatus.renewalDate.toLocaleDateString(undefined, dateOptions);
      
      renewalText = subscriptionStatus.canceled
        ? `Access until ${dateStr}`
        : `Renews on ${dateStr}`;
    }
    
    return {
      plan,
      status: planDisplay,
      renewalText,
      isActive: subscriptionStatus.active,
      isCanceled: subscriptionStatus.canceled,
      subscriptionId: subscriptionStatus.subscriptionId
    };
  };
  
  // Provide the context values
  const value = {
    isLoading,
    error,
    subscriptionStatus,
    hasPlan,
    hasFeature,
    canSaveMoreEstimates,
    getRemainingFreeEstimates,
    hasActivePlan,
    hasCanceledPlan,
    getCurrentPlan,
    getRenewalDate,
    getSubscriptionId,
    getSubscriptionDetails,
    FEATURE_ACCESS
  };
  
  return (
    <PremiumFeaturesContext.Provider value={value}>
      {children}
    </PremiumFeaturesContext.Provider>
  );
}