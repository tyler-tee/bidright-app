import React from 'react';
import { industries, projectTypes, featureOptions, complexityMultipliers } from '../data/industryData';

const EstimatorView = ({ 
  industry, 
  setIndustry, 
  projectType, 
  setProjectType, 
  complexity,
  setComplexity, 
  features, 
  setFeatures,
  setEstimate,
  setView,
  setShowPremiumPrompt,
  isLoading,
  setIsLoading,
  error,
  setError,
  trackEvent
}) => {
  
  const handleFeatureToggle = (featureId) => {
    setFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const calculateEstimate = () => {
    try {
      // Validate required fields
      if (!industry || !projectType) {
        console.log("Missing industry or project type");
        return null;
      }
      
      // Validate industry exists
      if (!projectTypes[industry]) {
        console.log("Invalid industry selected");
        return null;
      }
      
      // Find project
      const selectedProject = projectTypes[industry].find(p => p.id === projectType);
      if (!selectedProject) {
        console.log("Invalid project type selected");
        return null;
      }
      
      // Ensure complexity is valid
      const complexityLevel = complexity || 'medium';
      if (!complexityMultipliers[complexityLevel]) {
        console.log("Invalid complexity level");
        return null;
      }
      
      // Start with base values
      let totalHours = selectedProject.baseHours || 10;
      let totalCost = selectedProject.baseCost || 500;
      
      console.log(`Base values - Hours: ${totalHours}, Cost: ${totalCost}`);
      
      // Apply complexity multiplier
      const complexityMod = complexityMultipliers[complexityLevel];
      totalHours *= complexityMod.hourMod;
      totalCost *= complexityMod.costMod;
      
      console.log(`After complexity - Hours: ${totalHours}, Cost: ${totalCost}`);
      
      // Apply feature modifiers if applicable
      if (features && features.length > 0 && featureOptions[industry]) {
        features.forEach(featureId => {
          const feature = featureOptions[industry].find(f => f.id === featureId);
          if (feature) {
            totalHours *= feature.hourMod;
            totalCost *= feature.costMod;
            console.log(`Applied feature ${feature.name}`);
          }
        });
      }
      
      console.log(`After features - Hours: ${totalHours}, Cost: ${totalCost}`);
      
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
      
      console.log(`Final values - Hours: ${totalHours}, Cost: ${totalCost}`);
      
      return {
        hours: totalHours,
        hourRange,
        cost: totalCost,
        costRange,
        revisionLimit: 2,
        projectBreakdown: false,
        riskAssessment: false,
        competitorRates: false,
        // Add metadata for saved estimates
        created: new Date().toISOString(),
        id: Date.now().toString(),
        industryName: industries.find(i => i.id === industry)?.name,
        projectName: projectTypes[industry].find(p => p.id === projectType)?.name,
        complexityName: complexity.charAt(0).toUpperCase() + complexity.slice(1),
        featuresSelected: features.map(f => featureOptions[industry].find(opt => opt.id === f)?.name).filter(Boolean)
      };
    } catch (error) {
      console.error("Error calculating estimate:", error);
      return null;
    }
  };
  
  const handleCalculateClick = () => {
    try {
      if (!industry || !projectType) {
        setError("Please select both an industry and project type");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Simulate calculation delay for better UX
      setTimeout(() => {
        try {
          const result = calculateEstimate();
          if (result) {
            setEstimate(result);
            setView('result');
            setShowPremiumPrompt(true);
            
            // Track conversion
            trackEvent('estimate_created', {
              'industry': industry,
              'project_type': projectType,
              'complexity': complexity
            });
            
            console.log("Estimate calculated successfully:", result);
          } else {
            setError("There was an error calculating your estimate. Please try again.");
          }
        } catch (error) {
          console.error("Error in calculation:", error);
          setError("Something went wrong with the calculation. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }, 800); // Slight delay to show loading state
    } catch (error) {
      console.error("Error in handleCalculateClick:", error);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Project Estimate</h2>
      
      <div className="space-y-8">
        {/* Industry Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">1. Select Your Industry</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {industries.map(ind => (
              <button
                key={ind.id}
                type="button"
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  industry === ind.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => {
                  setIndustry(ind.id);
                  setProjectType('');
                  setFeatures([]);
                }}
              >
                <span className="text-3xl mb-2">{ind.icon}</span>
                <span className="text-sm text-center">{ind.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Project Type Selection */}
        {industry && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">2. Select Project Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectTypes[industry].map(project => (
                <button
                  key={project.id}
                  type="button"
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    projectType === project.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProjectType(project.id)}
                >
                  <div className="font-semibold">{project.name}</div>
                  <div className="text-sm text-gray-500">
                    Base: ~{project.baseHours} hours | {formatCurrency(project.baseCost)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Project Complexity */}
        {projectType && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">3. Project Complexity</h3>
            <div className="flex flex-wrap gap-4">
              {Object.keys(complexityMultipliers).map(level => (
                <button
                  key={level}
                  type="button"
                  className={`py-2 px-6 rounded-lg border-2 transition-all ${
                    complexity === level 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setComplexity(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional Features */}
        {projectType && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">4. Additional Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featureOptions[industry].map(feature => (
                <label
                  key={feature.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    features.includes(feature.id)
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-3 h-5 w-5 text-blue-600"
                    checked={features.includes(feature.id)}
                    onChange={() => handleFeatureToggle(feature.id)}
                  />
                  <span>{feature.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        {projectType && (
          <div className="pt-4">
            <button
              onClick={handleCalculateClick}
              disabled={isLoading}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg w-full text-lg transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Calculating...' : 'Calculate Estimate'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimatorView;