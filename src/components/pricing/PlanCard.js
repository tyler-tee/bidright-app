// src/components/pricing/PlanCard.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const PlanCard = ({ 
  plan, 
  name, 
  price, 
  annualPrice, 
  isPopular = false, 
  features = [], 
  onSelect,
  currentPlan,
  isAnnual,
  setIsAnnual,
  isLoading
}) => {
  const { currentUser } = useAuth();
  
  const isCurrentPlan = currentPlan === plan;
  
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
            <span className="text-3xl font-bold">${isAnnual ? annualPrice / 12 : price}</span>
            <span className="text-gray-500 ml-1">/month</span>
          </div>
          
          {isAnnual && (
            <p className="text-green-600 text-sm mt-1">Save ${price * 12 - annualPrice} annually</p>
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
        
        <button
          onClick={() => onSelect(plan, isAnnual)}
          disabled={isLoading || (isCurrentPlan && currentUser)}
          className={`
            w-full py-2 px-4 rounded-lg font-semibold
            ${
              isCurrentPlan && currentUser
                ? 'bg-green-100 text-green-800 cursor-default'
                : isPopular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
            }
            transition-colors
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isLoading 
            ? 'Processing...' 
            : isCurrentPlan && currentUser 
              ? 'Current Plan' 
              : 'Select Plan'}
        </button>
      </div>
    </div>
  );
};