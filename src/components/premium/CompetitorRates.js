// src/components/premium/CompetitorRates.js
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Competitor rates component for Premium users
 * Shows market rates by location and experience level
 */
const CompetitorRates = ({ 
  industry, 
  projectType,
  estimate,
  isUserPremium = false 
}) => {
  const [location, setLocation] = useState('us_average');
  const [ratesData, setRatesData] = useState(null);
  
  useEffect(() => {
    // In a real app, this would fetch from an API or database
    // Here we'll simulate with pre-defined data
    setRatesData(getCompetitorRatesData(industry, projectType, location));
  }, [industry, projectType, location]);
  
  // If user is not premium, show upgrade prompt
  if (!isUserPremium) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Market Rate Comparison</h3>
        <p className="text-gray-600 mb-4">
          See how your rates compare to market averages by location and experience level.
          Price your services competitively based on real market data.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Upgrade to Premium
        </button>
      </div>
    );
  }
  
  if (!ratesData) {
    return <div className="text-center py-8">Loading market rate data...</div>;
  }
  
  // Calculate hourly rate from estimate
  const estimatedHourlyRate = Math.round(estimate.cost / estimate.hours);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-purple-600 px-6 py-4 text-white">
        <h3 className="font-bold text-lg">Market Rate Comparison</h3>
        <p className="text-purple-100 text-sm">How your rates compare to market averages</p>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Compare rates in:
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full max-w-xs border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="us_average">United States (Average)</option>
            <option value="us_west_coast">US West Coast</option>
            <option value="us_east_coast">US East Coast</option>
            <option value="us_midwest">US Midwest</option>
            <option value="western_europe">Western Europe</option>
            <option value="eastern_europe">Eastern Europe</option>
            <option value="asia">Asia</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Experience Level</th>
                <th className="px-4 py-2 text-right border-b border-gray-200 font-semibold">Hourly Rate</th>
                <th className="px-4 py-2 text-right border-b border-gray-200 font-semibold">Comparison</th>
              </tr>
            </thead>
            <tbody>
              {ratesData.map((level, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 border-b border-gray-200">{level.level}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-right">{formatCurrency(level.rate)}/hr</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-right">
                    <div className="flex items-center justify-end">
                      <RateComparison yourRate={estimatedHourlyRate} marketRate={level.rate} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm">
          <p className="font-medium text-blue-800 mb-1">Your Estimated Rate: {formatCurrency(estimatedHourlyRate)}/hr</p>
          <p className="text-blue-600">
            Based on your estimate of {formatCurrency(estimate.cost)} for {estimate.hours} hours
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Rate comparison component that shows visual indicator
 */
function RateComparison({ yourRate, marketRate }) {
  // Calculate percentage difference
  const percentDiff = ((yourRate - marketRate) / marketRate) * 100;
  const roundedDiff = Math.round(percentDiff);
  
  let textClass = 'text-gray-600';
  let bgClass = 'bg-gray-200';
  
  if (roundedDiff > 10) {
    textClass = 'text-green-600';
    bgClass = 'bg-green-100';
  } else if (roundedDiff > 0) {
    textClass = 'text-green-600';
    bgClass = 'bg-green-50';
  } else if (roundedDiff < -10) {
    textClass = 'text-red-600';
    bgClass = 'bg-red-100';
  } else if (roundedDiff < 0) {
    textClass = 'text-red-600';
    bgClass = 'bg-red-50';
  }
  
  return (
    <div className={`px-3 py-1 rounded-full ${bgClass}`}>
      <span className={`text-xs font-medium ${textClass}`}>
        {roundedDiff > 0 ? '+' : ''}{roundedDiff}%
      </span>
    </div>
  );
}

/**
 * Get competitor rates data based on industry, project type, and location
 */
function getCompetitorRatesData(industry, projectType, location) {
  // This would normally come from an API - this is just sample data
  const baseRates = {
    'webdev': [
      { level: 'Entry Level', rate: 35 },
      { level: 'Mid Level', rate: 65 },
      { level: 'Senior Level', rate: 100 },
      { level: 'Expert Level', rate: 150 }
    ],
    'design': [
      { level: 'Entry Level', rate: 30 },
      { level: 'Mid Level', rate: 55 },
      { level: 'Senior Level', rate: 85 },
      { level: 'Expert Level', rate: 125 }
    ],
    'writing': [
      { level: 'Entry Level', rate: 25 },
      { level: 'Mid Level', rate: 45 },
      { level: 'Senior Level', rate: 75 },
      { level: 'Expert Level', rate: 120 }
    ],
    'marketing': [
      { level: 'Entry Level', rate: 30 },
      { level: 'Mid Level', rate: 60 },
      { level: 'Senior Level', rate: 95 },
      { level: 'Expert Level', rate: 145 }
    ],
    'video': [
      { level: 'Entry Level', rate: 35 },
      { level: 'Mid Level', rate: 70 },
      { level: 'Senior Level', rate: 110 },
      { level: 'Expert Level', rate: 160 }
    ]
  };
  
  // Location multipliers
  const locationMultipliers = {
    'us_average': 1.0,
    'us_west_coast': 1.3,
    'us_east_coast': 1.2,
    'us_midwest': 0.9,
    'western_europe': 1.1,
    'eastern_europe': 0.6,
    'asia': 0.5
  };
  
  // Project type adjustments
  const projectTypeAdjustments = {
    'webdev': {
      'landing': 0.8,
      'website': 1.0,
      'ecommerce': 1.2,
      'webapp': 1.3
    },
    'design': {
      'logo': 1.0,
      'branding': 1.2,
      'social': 0.9,
      'print': 0.9
    }
    // Add other industry project type adjustments as needed
  };
  
  // Get base rates for the industry
  const rates = baseRates[industry] || baseRates['webdev'];
  
  // Apply location multiplier
  const locationMultiplier = locationMultipliers[location] || 1.0;
  
  // Apply project type adjustment if available
  let projectTypeMultiplier = 1.0;
  if (projectTypeAdjustments[industry] && projectTypeAdjustments[industry][projectType]) {
    projectTypeMultiplier = projectTypeAdjustments[industry][projectType];
  }
  
  // Apply both multipliers
  return rates.map(rate => ({
    ...rate,
    rate: Math.round(rate.rate * locationMultiplier * projectTypeMultiplier)
  }));
}

export default CompetitorRates;