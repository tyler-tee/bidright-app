// src/views/PricingView.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus, createCheckoutSession } from '../services/subscription';
import PlanCard from '../components/pricing/PlanCard';

const PricingView = ({ setView, trackEvent }) => {
  const { currentUser, userProfile } = useAuth();
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
  
  const handleSelectPlan = async (plan, annual) => {
    try {
      setIsLoading(true);
      setError('');
      
      if (plan === 'free') {
        // Handle downgrade to free plan
        alert("Please contact support to downgrade to the free plan.");
        return;
      }
      
      if (!currentUser) {
        // Redirect to signup
        setView('signup');
        localStorage.setItem('selectedPlan', JSON.stringify({ plan, annual }));
        return;
      }
      
      // Track plan selection
      trackEvent('select_plan', { 
        plan, 
        billing_cycle: annual ? 'annual' : 'monthly'
      });
      
      // Create checkout session
      const checkoutUrl = await createCheckoutSession(
        currentUser.uid,
        plan,
        annual,
        `${window.location.origin}/account?subscription=success`,
        `${window.location.origin}/pricing?subscription=cancelled`
      );
      
      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError('Failed to process your request. Please try again.');
      console.error("Error selecting plan", err);
    } finally {
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
        'Competitor rate analysis',
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
          <PlanCard
            key={plan.plan}
            {...plan}
            currentPlan={currentPlan}
            isAnnual={isAnnual}
            setIsAnnual={setIsAnnual}
            onSelect={handleSelectPlan}
            isLoading={isLoading}
          />
        ))}
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