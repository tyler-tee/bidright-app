// src/views/PricingView.js - Updated with Project Profitability Analysis feature
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus } from '../services/stripeService';
import EnhancedPlanCard from '../components/pricing/EnhancedPlanCard';
import { usePremiumFeatures } from '../contexts/PremiumFeaturesContext';

const PricingView = ({ setView, trackEvent }) => {
  const { currentUser } = useAuth();
  const { getCurrentPlan } = usePremiumFeatures();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Get current subscription status
    const fetchSubscriptionStatus = async () => {
      if (currentUser) {
        try {
          const status = await getSubscriptionStatus(currentUser.uid);
          setCurrentPlan(status.plan);
        } catch (err) {
          console.error("Error fetching subscription", err);
        }
      } else {
        setCurrentPlan('free');
      }
    };
    
    fetchSubscriptionStatus();
  }, [currentUser]);
  
  const handleSelectPlan = async (plan, annual, action = 'checkout') => {
    try {
      setIsLoading(true);
      setError('');
      
      // Track plan selection
      trackEvent('select_plan', { 
        plan, 
        billing_cycle: annual ? 'annual' : 'monthly',
        action
      });
      
      // Handle different actions
      if (action === 'resume') {
        // Handle resume subscription logic
        // This would be implemented in the actual resumeSubscription function
        setIsLoading(false);
        return;
      }
      
      // Default checkout flow is handled by the EnhancedPlanCard component
      setIsLoading(false);
    } catch (err) {
      setError('Failed to process your request. Please try again.');
      console.error("Error selecting plan", err);
      setIsLoading(false);
    }
  };
  
  const plans = [
    {
      plan: 'free',
      name: 'Free',
      price: 0,
      annualPrice: 0,
      features: [
        'Basic project estimation',
        'Up to 3 saved estimates',
        'Industry-standard rate ranges',
        'One-time export functionality'
      ]
    },
    {
      plan: 'pro',
      name: 'Pro',
      price: 9.99,
      annualPrice: 99,
      isPopular: true,
      features: [
        'All Free features',
        'Unlimited saved estimates',
        'Detailed project breakdowns',
        'Risk assessment for project types',
        'PDF export with professional formatting',
        'White-label estimates'
      ]
    },
    {
      plan: 'premium',
      name: 'Premium',
      price: 19.99,
      annualPrice: 199,
      features: [
        'All Pro features',
        'Project profitability analysis',
        'Client management system',
        'Contract templates',
        'Priority email support'
      ]
    }
  ];
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose the Right Plan for Your Business</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Scale your freelance business with accurate estimates and professional tools
        </p>
        
        <div className="mt-8 inline-flex items-center p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setIsAnnual(false)}
            className={`py-2 px-4 rounded-md ${
              !isAnnual ? 'bg-white shadow-sm font-semibold' : 'text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`py-2 px-4 rounded-md flex items-center ${
              isAnnual ? 'bg-white shadow-sm font-semibold' : 'text-gray-700'
            }`}
          >
            Annual
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <EnhancedPlanCard
            key={plan.plan}
            {...plan}
            isAnnual={isAnnual}
            trackEvent={trackEvent}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>
      
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-6 text-center">Compare Plans</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left border-b border-gray-200">Feature</th>
                <th className="px-4 py-3 text-center border-b border-gray-200">Free</th>
                <th className="px-4 py-3 text-center border-b border-gray-200">Pro</th>
                <th className="px-4 py-3 text-center border-b border-gray-200">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Project Estimation</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Saved Estimates</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">Up to 3</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">Unlimited</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">Unlimited</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Export Options</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">Text Only</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">PDF + Branding</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">PDF + White Label</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Project Breakdown</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">-</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Risk Assessment</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">-</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Profitability Analysis</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">-</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">-</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Client Management</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">-</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">-</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Contract Templates</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">-</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">-</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">✓</td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium">Support</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">Standard</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">Standard</td>
                <td className="px-4 py-3 text-center border-b border-gray-200">Priority</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-500">
          All plans come with a 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  );
};

export default PricingView;