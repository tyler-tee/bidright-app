// src/utils/storage.js
/**
 * Save estimates to local storage
 * @param {Array} estimates - Array of estimate objects
 * @returns {boolean} Success status
 */
export const saveEstimates = (estimates) => {
  try {
    localStorage.setItem('freelanceEstimates', JSON.stringify(estimates));
    return true;
  } catch (error) {
    console.error("Error saving estimates:", error);
    return false;
  }
};

/**
 * Load estimates from local storage
 * @returns {Array} Array of saved estimates
 */
export const loadEstimates = () => {
  try {
    const data = localStorage.getItem('freelanceEstimates');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading estimates:", error);
    return [];
  }
};

/**
 * Save a single estimate to local storage
 * @param {Object} estimate - Estimate to save
 * @param {Array} existingEstimates - Existing estimates array
 * @returns {Array} Updated estimates array
 */
export const saveEstimate = (estimate, existingEstimates = []) => {
  try {
    const updatedEstimates = [...existingEstimates, estimate];
    saveEstimates(updatedEstimates);
    return updatedEstimates;
  } catch (error) {
    console.error("Error saving estimate:", error);
    return existingEstimates;
  }
};

/**
 * Delete an estimate from local storage
 * @param {string} estimateId - ID of estimate to delete
 * @param {Array} existingEstimates - Existing estimates array
 * @returns {Array} Updated estimates array
 */
export const deleteEstimate = (estimateId, existingEstimates = []) => {
  try {
    const updatedEstimates = existingEstimates.filter(est => est.id !== estimateId);
    saveEstimates(updatedEstimates);
    return updatedEstimates;
  } catch (error) {
    console.error("Error deleting estimate:", error);
    return existingEstimates;
  }
};