// src/components/premium/EnhancedCompetitorRates.js
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { usePremiumFeatures } from '../../contexts/PremiumFeaturesContext';

/**
 * Enhanced competitor rates component for Premium users
 * Shows market rates by location and experience level with interactive filters
 */
const EnhancedCompetitorRates = ({ 
  industry, 
  projectType,
  estimate,
  metadata
}) => {
  const { hasFeature } = usePremiumFeatures();
  const isPremiumFeature = hasFeature('competitor_rates');
  
  const [location, setLocation] = useState('us_average');
  const [showDetails, setShowDetails] = useState(false);
  const [ratesData, setRatesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadReady, setDownloadReady] = useState(false);
  
  useEffect(() => {
    // Fetch competitor rates data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use the mock data function
        const data = getCompetitorRatesData(industry, projectType, location);
        setRatesData(data);
        setDownloadReady(true);
      } catch (error) {
        console.error('Error fetching competitor rates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [industry, projectType, location]);
  
  // If user doesn't have premium feature access, show upgrade prompt
  if (!isPremiumFeature) {
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
  
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!ratesData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No market rate data available for this industry and project type.</p>
      </div>
    );
  }
  
  // Calculate hourly rate from estimate
  const estimatedHourlyRate = Math.round(estimate.cost / estimate.hours);
  
  // Calculate market position stats
  const averageMarketRate = ratesData.reduce((sum, rate) => sum + rate.rate, 0) / ratesData.length;
  const percentDiff = ((estimatedHourlyRate - averageMarketRate) / averageMarketRate) * 100;
  const marketPosition = getMarketPosition(percentDiff);
  
  // Calculate potential annual income based on rates
  const calculateAnnualIncome = (hourlyRate, hoursPerWeek = 40) => {
    const weeksPerYear = 50; // Accounting for 2 weeks off
    return hourlyRate * hoursPerWeek * weeksPerYear;
  };
  
  // Download rates data as CSV
  const downloadRatesAsCsv = () => {
    const headers = ['Experience Level', 'Hourly Rate', 'Comparison', 'Annual Income (Full-time)'];
    const rows = ratesData.map(level => [
      level.level,
      formatCurrency(level.rate).replace('$', ''),
      `${Math.round(((estimatedHourlyRate - level.rate) / level.rate) * 100)}%`,
      formatCurrency(calculateAnnualIncome(level.rate)).replace('$', '')
    ]);
    
    // Add your rate row
    rows.push([
      'Your Rate',
      formatCurrency(estimatedHourlyRate).replace('$', ''),
      '0%',
      formatCurrency(calculateAnnualIncome(estimatedHourlyRate)).replace('$', '')
    ]);
    
    // Create CSV content
    const csvContent = [
      `Market Rates for ${metadata?.industryName || industry} - ${metadata?.projectName || projectType}`,
      `Location: ${getLocationName(location)}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `market_rates_${industry}_${projectType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-purple-600 px-6 py-4 text-white">
        <h3 className="font-bold text-lg">Market Rate Comparison</h3>
        <p className="text-purple-100 text-sm">How your rates compare to market averages</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6 bg-blue-50 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Your Rate: {formatCurrency(estimatedHourlyRate)}/hr</h4>
              <p className="text-blue-600 text-sm">
                Based on {formatCurrency(estimate.cost)} for {estimate.hours} hours
              </p>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-lg border border-blue-200">
              <span className="text-sm text-gray-600">Market Position: </span>
              <span className={`font-medium ${marketPosition.color}`}>
                {marketPosition.label} ({percentDiff > 0 ? '+' : ''}{Math.round(percentDiff)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="md:w-1/2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Compare rates in:
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="us_average">United States (Average)</option>
              <option value="us_west_coast">US West Coast</option>
              <option value="us_east_coast">US East Coast</option>
              <option value="us_midwest">US Midwest</option>
              <option value="us_south">US South</option>
              <option value="western_europe">Western Europe</option>
              <option value="eastern_europe">Eastern Europe</option>
              <option value="uk">United Kingdom</option>
              <option value="australia">Australia</option>
              <option value="canada">Canada</option>
              <option value="asia">Asia</option>
              <option value="latin_america">Latin America</option>
            </select>
          </div>
          
          <div className="md:w-1/2 flex items-end">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline focus:outline-none"
            >
              {showDetails ? 'Hide detailed analysis' : 'Show detailed analysis'}
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Experience Level</th>
                <th className="px-4 py-2 text-right border-b border-gray-200 font-semibold">Hourly Rate</th>
                <th className="px-4 py-2 text-right border-b border-gray-200 font-semibold">Comparison</th>
                {showDetails && (
                  <th className="px-4 py-2 text-right border-b border-gray-200 font-semibold">Annual Income (Full-time)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {ratesData.map((level, index) => {
                const rateDiff = ((estimatedHourlyRate - level.rate) / level.rate) * 100;
                const roundedDiff = Math.round(rateDiff);
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 border-b border-gray-200">{level.level}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-right">{formatCurrency(level.rate)}/hr</td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-end">
                        <RateComparison yourRate={estimatedHourlyRate} marketRate={level.rate} />
                      </div>
                    </td>
                    {showDetails && (
                      <td className="px-4 py-3 border-b border-gray-200 text-right">
                        {formatCurrency(calculateAnnualIncome(level.rate))}/yr
                      </td>
                    )}
                  </tr>
                );
              })}
              
              {/* Your rate row */}
              <tr className="bg-blue-50 font-medium">
                <td className="px-4 py-3 border-b border-gray-200">Your Rate</td>
                <td className="px-4 py-3 border-b border-gray-200 text-right">{formatCurrency(estimatedHourlyRate)}/hr</td>
                <td className="px-4 py-3 border-b border-gray-200 text-right">
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    Baseline
                  </div>
                </td>
                {showDetails && (
                  <td className="px-4 py-3 border-b border-gray-200 text-right">
                    {formatCurrency(calculateAnnualIncome(estimatedHourlyRate))}/yr
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
        
        {showDetails && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Market Analysis Insights</h4>
            <p className="text-sm text-gray-700 mb-3">
              {getMarketInsight(industry, projectType, estimatedHourlyRate, averageMarketRate, percentDiff)}
            </p>
            
            <h5 className="font-medium text-sm mb-1">Recommendations:</h5>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {getRateRecommendations(percentDiff).map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
        
        {downloadReady && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={downloadRatesAsCsv}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Rate Data
            </button>
          </div>
        )}
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
  
  if (roundedDiff > 20) {
    textClass = 'text-green-700';
    bgClass = 'bg-green-100';
  } else if (roundedDiff > 0) {
    textClass = 'text-green-600';
    bgClass = 'bg-green-50';
  } else if (roundedDiff < -20) {
    textClass = 'text-red-700';
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
 * Get the location name from the code
 */
function getLocationName(locationCode) {
  const locations = {
    'us_average': 'United States (Average)',
    'us_west_coast': 'US West Coast',
    'us_east_coast': 'US East Coast',
    'us_midwest': 'US Midwest',
    'us_south': 'US South',
    'western_europe': 'Western Europe',
    'eastern_europe': 'Eastern Europe',
    'uk': 'United Kingdom',
    'australia': 'Australia',
    'canada': 'Canada',
    'asia': 'Asia',
    'latin_america': 'Latin America'
  };
  
  return locations[locationCode] || locationCode;
}

/**
 * Get market position label and color based on percentage difference
 */
function getMarketPosition(percentDiff) {
  if (percentDiff > 30) {
    return { label: 'Premium', color: 'text-green-600' };
  } else if (percentDiff > 10) {
    return { label: 'Above Average', color: 'text-green-600' };
  } else if (percentDiff >= -10) {
    return { label: 'Competitive', color: 'text-blue-600' };
  } else if (percentDiff >= -30) {
    return { label: 'Below Average', color: 'text-yellow-600' };
  } else {
    return { label: 'Significantly Underpriced', color: 'text-red-600' };
  }
}

/**
 * Get rate recommendations based on percentage difference
 */
function getRateRecommendations(percentDiff) {
  if (percentDiff > 30) {
    return [
      'Your rate is significantly higher than market average, which works if you offer premium service.',
      'Ensure your service quality and deliverables justify the premium pricing.',
      'Consider highlighting your unique value proposition in proposals.',
      'Track client satisfaction closely to validate premium pricing.'
    ];
  } else if (percentDiff > 10) {
    return [
      'Your rate is above market average, positioning you as a higher-quality provider.',
      'Emphasize your expertise and quality in your client communications.',
      'Consider creating case studies to demonstrate your value.',
      'Look for opportunities to offer premium add-on services.'
    ];
  } else if (percentDiff >= -10) {
    return [
      'Your rate is in line with market averages, which is a competitive position.',
      'To increase profitability, look for efficiency improvements in your process.',
      'Consider creating service packages that include higher-value components.',
      'Track your utilization rate to ensure you\'re maximizing billable hours.'
    ];
  } else if (percentDiff >= -30) {
    return [
      'Your rate is below market average, which may be leaving money on the table.',
      'Consider gradually increasing your rates for new clients.',
      'Focus on demonstrating your value through case studies and testimonials.',
      'Look for higher-value projects where clients are less price-sensitive.'
    ];
  } else {
    return [
      'Your rate is significantly below market average, suggesting you are undervaluing your services.',
      'Develop a plan to increase your rates significantly, either immediately or over time.',
      'Consider repositioning your services to target clients who value quality over price.',
      'Review your costs and ensure your current rates are at least covering all expenses and providing adequate profit.'
    ];
  }
}

/**
 * Get market insight based on industry, project type, and rates
 */
function getMarketInsight(industry, projectType, yourRate, marketAverage, percentDiff) {
  const position = getMarketPosition(percentDiff);
  
  let insight = `Your hourly rate of ${formatCurrency(yourRate)} is `;
  
  if (percentDiff > 0) {
    insight += `${Math.round(percentDiff)}% higher than the market average of ${formatCurrency(marketAverage)} for this type of work. `;
  } else if (percentDiff < 0) {
    insight += `${Math.abs(Math.round(percentDiff))}% lower than the market average of ${formatCurrency(marketAverage)} for this type of work. `;
  } else {
    insight += `exactly at the market average of ${formatCurrency(marketAverage)} for this type of work. `;
  }
  
  // Add industry-specific insights
  switch (industry) {
    case 'webdev':
      insight += `Web development rates vary significantly based on complexity, technologies used, and client size. `;
      
      if (projectType === 'ecommerce') {
        insight += `E-commerce development tends to command higher rates due to the specialized knowledge required for payment integration, security, and inventory management.`;
      } else if (projectType === 'webapp') {
        insight += `Web application development typically demands higher rates due to the complexity of interactive features and backend infrastructure.`;
      } else {
        insight += `Standard websites and landing pages have more competitive pricing due to the availability of templates and page builders.`;
      }
      break;
      
    case 'design':
      insight += `Design rates can vary based on client industry, deliverable quality, and your personal style/brand. `;
      
      if (projectType === 'branding') {
        insight += `Brand package work typically commands premium rates due to the strategic thinking and comprehensive deliverables involved.`;
      } else if (projectType === 'logo') {
        insight += `Logo design has a wide range of pricing, from budget-friendly to high-end, based on research, iterations, and originality.`;
      } else {
        insight += `Regular design work like social media graphics tends to be more price-sensitive and competitive.`;
      }
      break;
      
    case 'writing':
      insight += `Writing rates vary based on specialization, research requirements, and content complexity. `;
      
      if (projectType === 'whitepaper') {
        insight += `Whitepapers and technical writing typically command higher rates due to the expertise and research required.`;
      } else if (projectType === 'seo') {
        insight += `SEO content has specialized requirements that can justify higher rates when you demonstrate measurable results.`;
      } else {
        insight += `Blog articles and standard content tend to have more competitive pricing due to the large pool of available writers.`;
      }
      break;
      
    default:
      insight += `Consider your unique value proposition and the specific needs of your target clients when setting your rates.`;
  }
  
  return insight;
}

/**
 * Get competitor rates data based on industry, project type, and location
 */
function getCompetitorRatesData(industry, projectType, location) {
  // This would normally come from an API - this is just sample data
  const baseRates = {
    'webdev': [
      { level: 'Junior (1-2 years)', rate: 35 },
      { level: 'Mid-level (3-5 years)', rate: 65 },
      { level: 'Senior (5-8 years)', rate: 100 },
      { level: 'Expert (8+ years)', rate: 150 },
      { level: 'Agency Average', rate: 125 }
    ],
    'design': [
      { level: 'Junior (1-2 years)', rate: 30 },
      { level: 'Mid-level (3-5 years)', rate: 55 },
      { level: 'Senior (5-8 years)', rate: 85 },
      { level: 'Expert (8+ years)', rate: 125 },
      { level: 'Agency Average', rate: 110 }
    ],
    'writing': [
      { level: 'Junior (1-2 years)', rate: 25 },
      { level: 'Mid-level (3-5 years)', rate: 45 },
      { level: 'Senior (5-8 years)', rate: 75 },
      { level: 'Expert (8+ years)', rate: 120 },
      { level: 'Agency Average', rate: 95 }
    ],
    'marketing': [
      { level: 'Junior (1-2 years)', rate: 30 },
      { level: 'Mid-level (3-5 years)', rate: 60 },
      { level: 'Senior (5-8 years)', rate: 95 },
      { level: 'Expert (8+ years)', rate: 145 },
      { level: 'Agency Average', rate: 125 }
    ],
    'video': [
      { level: 'Junior (1-2 years)', rate: 35 },
      { level: 'Mid-level (3-5 years)', rate: 70 },
      { level: 'Senior (5-8 years)', rate: 110 },
      { level: 'Expert (8+ years)', rate: 160 },
      { level: 'Agency Average', rate: 140 }
    ]
  };
  
  // Location multipliers
  const locationMultipliers = {
    'us_average': 1.0,
    'us_west_coast': 1.35,
    'us_east_coast': 1.25,
    'us_midwest': 0.85,
    'us_south': 0.9,
    'western_europe': 1.15,
    'eastern_europe': 0.6,
    'uk': 1.1,
    'australia': 1.05,
    'canada': 0.95,
    'asia': 0.55,
    'latin_america': 0.65
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
      'social': 0.85,
      'print': 0.9
    },
    'writing': {
      'article': 0.9,
      'whitepaper': 1.3,
      'emailseq': 1.0,
      'seo': 1.1
    },
    'marketing': {
      'smm': 1.0,
      'ppc': 1.1,
      'seo': 1.2,
      'email': 0.9
    },
    'video': {
      'explainer': 1.1,
      'promo': 1.0,
      'interview': 0.9,
      'animation': 1.3
    }
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

export default EnhancedCompetitorRates;