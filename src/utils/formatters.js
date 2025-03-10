// src/utils/formatters.js
/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  /**
   * Format a date string
   * @param {string} dateString - ISO date string
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date
   */
  export const formatDate = (dateString, options = {}) => {
    const date = new Date(dateString);
    const defaultOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  };
  
  /**
   * Generate a text summary of an estimate
   * @param {Object} estimate - The estimate object
   * @param {Object} metadata - Additional metadata (industry name, project name, etc.)
   * @returns {string} Formatted text summary
   */
  export const generateEstimateSummary = (estimate, metadata) => {
    if (!estimate) return '';
    
    // Format the features as a list
    const featuresList = metadata.features?.map(feature => {
      return `- ${feature}`;
    }).join('\n') || '';
    
    // Create a professional-looking text summary
    return `
  # FREELANCE PROJECT ESTIMATE
  
  ## Project Details
  Industry: ${metadata.industryName || 'Custom Project'}
  Project Type: ${metadata.projectName || 'Custom Type'}
  Complexity: ${metadata.complexityName || 'Medium'}
  Date: ${formatDate(estimate.created || new Date().toISOString())}
  
  ## Estimate Summary
  Time Estimate: ${estimate.hourRange.min}-${estimate.hourRange.max} hours
  Cost Estimate: ${formatCurrency(estimate.costRange.min)}-${formatCurrency(estimate.costRange.max)}
  
  ${featuresList ? `## Included Features\n${featuresList}` : ''}
  
  ---
  Generated by BidRight.app | ${window.location.origin}
    `.trim();
  };