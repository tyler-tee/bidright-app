// src/components/premium/ProjectProfitabilityAnalysis.js
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { usePremiumFeatures } from '../../contexts/PremiumFeaturesContext';

/**
 * Project Profitability Analysis component for Premium users
 * Helps users calculate true project profitability and optimize pricing
 */
const ProjectProfitabilityAnalysis = ({ 
  estimate
}) => {
  const { hasFeature } = usePremiumFeatures();
  const isPremiumFeature = hasFeature('profitability_analysis');
  
  const [overhead, setOverhead] = useState(30); // Default 30% overhead
  const [targetProfit, setTargetProfit] = useState(20); // Default 20% profit margin
  const [hourlyRate] = useState(estimate ? Math.round(estimate.cost / estimate.hours) : 50);
  const [nonBillableHours, setNonBillableHours] = useState(25); // % of time spent on non-billable work
  
  // If user doesn't have premium feature access, show upgrade prompt
  if (!isPremiumFeature) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Profitability Analysis</h3>
        <p className="text-gray-600 mb-4">
          Calculate true project profitability considering overhead, target margins, and non-billable time.
          Optimize your pricing for sustainable business growth.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Upgrade to Premium
        </button>
      </div>
    );
  }
  
  if (!estimate) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Please create an estimate first to analyze profitability.</p>
      </div>
    );
  }
  
  // Calculate profitability metrics
  const projectHours = estimate.hours;
  const projectRevenue = estimate.cost;
  
  // Calculate effective hourly rate (accounting for non-billable time)
  const effectiveHourlyRate = calculateEffectiveRate(hourlyRate, nonBillableHours);
  
  // Calculate overhead costs for this project
  const overheadCosts = (projectRevenue * (overhead / 100));
  
  // Calculate current profit
  const currentProfit = projectRevenue - overheadCosts - (projectHours * effectiveHourlyRate);
  const currentProfitMargin = (currentProfit / projectRevenue) * 100;
  
  // Calculate recommended price to achieve target profit
  const recommendedPrice = calculateRecommendedPrice(
    projectHours, 
    effectiveHourlyRate, 
    overhead, 
    targetProfit
  );
  
  // Calculate price difference
  const priceDifference = recommendedPrice - projectRevenue;
  const priceDifferencePercentage = (priceDifference / projectRevenue) * 100;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-green-600 px-6 py-4 text-white">
        <h3 className="font-bold text-lg">Project Profitability Analysis</h3>
        <p className="text-green-100 text-sm">Calculate true project profitability and optimize pricing</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Current Project Estimate</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Project Revenue:</p>
                  <p className="font-semibold">{formatCurrency(projectRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Project Hours:</p>
                  <p className="font-semibold">{projectHours} hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hourly Rate:</p>
                  <p className="font-semibold">{formatCurrency(hourlyRate)}/hr</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Effective Rate:</p>
                  <p className="font-semibold">{formatCurrency(effectiveHourlyRate)}/hr</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Business Parameters</h4>
            <div className="space-y-3">
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Overhead Percentage:</span>
                  <span className="text-gray-500">{overhead}%</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={overhead}
                  onChange={(e) => setOverhead(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Business costs including rent, software, insurance, taxes, etc.
                </p>
              </div>
              
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Target Profit Margin:</span>
                  <span className="text-gray-500">{targetProfit}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={targetProfit}
                  onChange={(e) => setTargetProfit(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="flex justify-between text-sm mb-1">
                  <span>Non-Billable Time:</span>
                  <span className="text-gray-500">{nonBillableHours}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={nonBillableHours}
                  onChange={(e) => setNonBillableHours(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time spent on marketing, admin, learning, etc. (not directly billable)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Current Profitability</h4>
            <div className={`rounded-lg p-4 ${currentProfitMargin >= targetProfit ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Revenue:</span>
                  <span className="font-medium">{formatCurrency(projectRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Overhead Costs:</span>
                  <span className="font-medium">- {formatCurrency(overheadCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Effective Labor:</span>
                  <span className="font-medium">- {formatCurrency(projectHours * effectiveHourlyRate)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span>Profit:</span>
                  <span className={currentProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(currentProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Margin:</span>
                  <span className={currentProfitMargin >= targetProfit ? 'text-green-600' : 'text-yellow-600'}>
                    {currentProfitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Recommended Pricing</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Current Price:</span>
                  <span className="font-medium">{formatCurrency(projectRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Recommended Price:</span>
                  <span className="font-semibold">{formatCurrency(recommendedPrice)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span>Price Difference:</span>
                  <span className={priceDifference >= 0 ? 'text-blue-600 font-medium' : 'text-red-600 font-medium'}>
                    {priceDifference >= 0 ? '+' : ''}{formatCurrency(priceDifference)} ({priceDifferencePercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>For Target Profit:</span>
                  <span className="font-medium">{targetProfit}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Profitability Insights</h4>
          <div className="text-sm text-gray-700 space-y-2">
            {currentProfitMargin < 0 ? (
              <p className="text-red-600 font-medium">
                Your current pricing results in a loss. Consider raising your rates or reducing project scope.
              </p>
            ) : currentProfitMargin < targetProfit ? (
              <p className="text-yellow-600 font-medium">
                Your project is profitable but below your target margin. Consider adjusting your rates for future projects.
              </p>
            ) : (
              <p className="text-green-600 font-medium">
                Your project meets or exceeds your target profit margin. Great job on your pricing!
              </p>
            )}
            
            <p>
              <strong>Business impact:</strong> At your current pricing, if you complete 10 similar projects per year, 
              your annual profit would be approximately {formatCurrency(currentProfit * 10)}.
            </p>
            
            <p>
              <strong>Recommendation:</strong> {getRecommendation(currentProfitMargin, targetProfit, priceDifferencePercentage)}
            </p>
            
            <p className="text-xs text-gray-500 italic mt-4">
              Note: This analysis is for guidance only. Your actual costs and profits may vary based on specific project circumstances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Calculate effective hourly rate accounting for non-billable time
 */
function calculateEffectiveRate(hourlyRate, nonBillablePercentage) {
  // When considering non-billable time, the effective hourly cost increases
  // Example: If you can only bill 80% of your time, your $50/hr rate needs to cover the 20% non-billable time too
  if (nonBillablePercentage >= 100) return hourlyRate * 2; // Cap at 100% to avoid division by zero
  return hourlyRate * (1 - (nonBillablePercentage / 100));
}

/**
 * Calculate recommended price based on business parameters
 */
function calculateRecommendedPrice(hours, effectiveHourlyRate, overheadPercentage, targetProfitPercentage) {
  // Calculate labor cost
  const laborCost = hours * effectiveHourlyRate;
  
  // Calculate price that covers labor, overhead, and target profit
  // Formula: Price = (Labor Cost) / (1 - Overhead% - Target Profit%)
  const denominator = 1 - (overheadPercentage / 100) - (targetProfitPercentage / 100);
  
  // Prevent division by zero or negative denominators
  if (denominator <= 0) return laborCost * 3; // Default to 3x labor cost in extreme cases
  
  return Math.round(laborCost / denominator);
}

/**
 * Get recommendation based on profitability metrics
 */
function getRecommendation(currentMargin, targetMargin, priceDiffPercentage) {
  if (currentMargin < 0) {
    return `Increase your price by at least ${Math.abs(priceDiffPercentage).toFixed(1)}% to avoid losses on this type of project.`;
  } else if (currentMargin < targetMargin) {
    return `A price increase of ${priceDiffPercentage.toFixed(1)}% would help you reach your target profit margin of ${targetMargin}%.`;
  } else if (currentMargin >= targetMargin && currentMargin < targetMargin * 1.5) {
    return `Your current pricing meets your target margins. Consider additional value-added services to increase profitability further.`;
  } else {
    return `Your project is exceptionally profitable. Consider if there are opportunities to provide additional value to clients or take on more similar projects.`;
  }
}

export default ProjectProfitabilityAnalysis;