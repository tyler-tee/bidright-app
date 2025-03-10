// src/utils/premiumAccess.js

/**
 * Utility functions to check user's access to premium features
 */

/**
 * Check if user has access to a specific feature
 * @param {Object} userDetails - User details from AuthContext
 * @param {string} feature - Feature to check access for
 * @returns {boolean} - Whether user has access to the feature
 */
export const hasFeatureAccess = (userDetails, feature) => {
    if (!userDetails) return false;
    
    const userPlan = userDetails.plan || 'free';
    
    // Define which features are available in which plans
    const featureAccessMap = {
      // Basic features available in all plans
      'basic_estimation': ['free', 'pro', 'premium'],
      'save_estimates': ['free', 'pro', 'premium'],
      
      // Pro features
      'unlimited_estimates': ['pro', 'premium'],
      'project_breakdown': ['pro', 'premium'],
      'risk_assessment': ['pro', 'premium'],
      'pdf_export': ['pro', 'premium'],
      'white_label': ['pro', 'premium'],
      
      // Premium-only features
      'competitor_rates': ['premium'],
      'client_management': ['premium'],
      'contract_templates': ['premium'],
      'priority_support': ['premium'],
    };
    
    // Check if the feature exists in the map and if user's plan has access
    return featureAccessMap[feature]?.includes(userPlan) || false;
  };
  
  /**
   * Check if user has access to premium features (Pro or Premium plan)
   * @param {Object} userDetails - User details from AuthContext
   * @returns {boolean} - Whether user has premium access
   */
  export const hasPremiumAccess = (userDetails) => {
    if (!userDetails) return false;
    
    const userPlan = userDetails.plan || 'free';
    return ['pro', 'premium'].includes(userPlan);
  };
  
  /**
   * Check if user has access to specific tier
   * @param {Object} userDetails - User details from AuthContext
   * @param {string} tier - Tier to check ('free', 'pro', 'premium')
   * @returns {boolean} - Whether user has access to the tier
   */
  export const hasTierAccess = (userDetails, tier) => {
    if (!userDetails) return tier === 'free';
    
    const userPlan = userDetails.plan || 'free';
    
    // Define tier hierarchy
    const tiers = ['free', 'pro', 'premium'];
    const userTierIndex = tiers.indexOf(userPlan);
    const requestedTierIndex = tiers.indexOf(tier);
    
    // User has access if their tier is equal or higher to requested tier
    return userTierIndex >= requestedTierIndex;
  };
  
  /**
   * Get remaining free estimates for free plan users
   * @param {Object} userDetails - User details from AuthContext
   * @param {number} savedEstimatesCount - Number of saved estimates
   * @returns {number} - Number of remaining free estimates
   */
  export const getRemainingFreeEstimates = (userDetails, savedEstimatesCount) => {
    if (hasPremiumAccess(userDetails)) {
      return Infinity; // Unlimited for premium users
    }
    
    const MAX_FREE_ESTIMATES = 3;
    return Math.max(0, MAX_FREE_ESTIMATES - savedEstimatesCount);
  };