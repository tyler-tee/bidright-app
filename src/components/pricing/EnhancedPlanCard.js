// src/components/pricing/EnhancedPlanCard.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePremiumFeatures } from '../../contexts/PremiumFeaturesContext';
import StripeCheckoutButton from '../subscription/StripeCheckoutButton';

/**
 * Enhanced pricing plan card with Stripe integration
 */
const EnhancedPlanCard = ({ 
  plan, 
  name, 
  price, 
  annualPrice,
  features = [], 
  isPopular = false,
  isAnnual,
  trackEvent,
  onSelectPlan
}) => {
  const { currentUser } = useAuth();
  const { getCurrentPlan, hasCanceledPlan } = usePremiumFeatures();
  const [error, setError] = useState(null);
  
  // Get the current plan and check if it's a canceled plan
  const currentPlan = getCurrentPlan();
  const isCurrentPlan = currentPlan === plan;
  const isCanceled = hasCanceledPlan();
  
  // Calculate monthly price for annual billing
  const monthlyPrice = isAnnual ? (annualPrice / 12).toFixed(2) : price;
  
  // Calculate annual savings
  const annualSavings = price * 12 - annualPrice;
  
  // Handle checkout error
  const handleCheckoutError = (error) => {
    setError('Unable to process checkout. Please try again later.');
    console.error('Checkout error:', error);
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
        isPopular ? 'border-blue-500' : 'border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="bg-blue-500 text-white py-1 px-6 text-sm font-bold text-center">
          MOST POPULAR
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">${monthlyPrice}</span>
            <span className="text-gray-500 ml-1">/month</span>
          </div>
          
          {isAnnual && price > 0 && (
            <p className="text-green-600 text-sm mt-1">
              Save ${annualSavings.toFixed(2)} annually
            </p>
          )}
        </div>
        
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}
        
        {isCurrentPlan && isCanceled ? (
          <div className="mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              Your subscription will end at the end of your billing period.
            </div>
            <button
              onClick={() => onSelectPlan && onSelectPlan(plan, isAnnual, 'resume')}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Resume Subscription
            </button>
          </div>
        ) : (
          <StripeCheckoutButton
            plan={plan}
            isAnnual={isAnnual}
            className="w-full"
            buttonText={
              plan === 'free' 
                ? 'Current Plan' 
                : isCurrentPlan 
                  ? 'Current Plan' 
                  : `Select ${name}`
            }
            variant={isPopular ? 'primary' : 'secondary'}
            trackEvent={trackEvent}
            onCheckoutStarted={() => onSelectPlan && onSelectPlan(plan, isAnnual, 'checkout')}
            onCheckoutError={handleCheckoutError}
            disabled={plan === 'free' || (isCurrentPlan && !isCanceled)}
          >
            {plan === 'free' 
              ? 'Free Plan' 
              : isCurrentPlan && !isCanceled
                ? 'Current Plan' 
                : `Select ${name}`
            }
          </StripeCheckoutButton>
        )}
        
        {plan !== 'free' && (
          <p className="text-xs text-center text-gray-500 mt-3">
            {isAnnual ? 'Billed annually' : 'Billed monthly'} • Cancel anytime
          </p>
        )}
      </div>
    </div>
  );
};

export default EnhancedPlanCard;