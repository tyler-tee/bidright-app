import { complexityMultipliers, projectTypes, featureOptions } from '../data/industryData';

/**
 * Calculate a project estimate based on selected options
 * @param {Object} params - Estimation parameters
 * @param {string} params.industry - Industry ID
 * @param {string} params.projectType - Project type ID
 * @param {string} params.complexity - Complexity level
 * @param {Array} params.features - Array of feature IDs
 * @returns {Object} The calculated estimate with ranges and metadata
 */
export const calculateEstimate = ({ industry, projectType, complexity = 'medium', features = [] }) => {
  try {
    // Validate required fields
    if (!industry || !projectType) {
      console.error("Missing industry or project type");
      return null;
    }
    
    // Validate industry exists
    if (!projectTypes[industry]) {
      console.error("Invalid industry selected");
      return null;
    }
    
    // Find project
    const selectedProject = projectTypes[industry].find(p => p.id === projectType);
    if (!selectedProject) {
      console.error("Invalid project type selected");
      return null;
    }
    
    // Ensure complexity is valid
    if (!complexityMultipliers[complexity]) {
      console.error("Invalid complexity level");
      return null;
    }
    
    // Start with base values
    let totalHours = selectedProject.baseHours;
    let totalCost = selectedProject.baseCost;
    
    // Apply complexity multiplier
    const complexityMod = complexityMultipliers[complexity];
    totalHours *= complexityMod.hourMod;
    totalCost *= complexityMod.costMod;
    
    // Apply feature modifiers
    if (features.length > 0 && featureOptions[industry]) {
      features.forEach(featureId => {
        const feature = featureOptions[industry].find(f => f.id === featureId);
        if (feature) {
          totalHours *= feature.hourMod;
          totalCost *= feature.costMod;
        }
      });
    }
    
    // Round to reasonable values
    totalHours = Math.round(totalHours);
    totalCost = Math.round(totalCost / 50) * 50; // Round to nearest $50
    
    // Create ranges for more realistic estimates
    const hourRange = {
      min: Math.round(totalHours * 0.8),
      max: Math.round(totalHours * 1.2)
    };
    
    const costRange = {
      min: Math.round((totalCost * 0.9) / 50) * 50,
      max: Math.round((totalCost * 1.1) / 50) * 50
    };
    
    // Return complete estimate object
    return {
      hours: totalHours,
      hourRange,
      cost: totalCost,
      costRange,
      revisionLimit: 2,
      projectBreakdown: false, // Premium feature placeholder
      riskAssessment: false,   // Premium feature placeholder 
      competitorRates: false,  // Premium feature placeholder
      created: new Date().toISOString(),
      id: Date.now().toString()
    };
  } catch (error) {
    console.error("Error calculating estimate:", error);
    return null;
  }
};