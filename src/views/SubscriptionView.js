// src/views/SubscriptionView.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus, createCheckoutSession, cancelSubscription } from '../services/subscription';

const SubscriptionView = ({ setView, trackEvent }) => {
  const { currentUser } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [error, setError] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(false);
  
  useEffect(() => {
    // Get current subscription status
    const fetchSubscriptionStatus = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          const status = await getSubscriptionStatus(currentUser.uid);
          setCurrentPlan(status.plan || 'free');
          setSubscriptionDetails(status);
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching subscription", err);
          setIsLoading(false);
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
      
      if (plan === 'free' && currentPlan !== 'free') {
        // Handle downgrade to free plan
        setCancelConfirm(true);
        setIsLoading(false);
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
        `${window.location.origin}/subscription?subscription=cancelled`
      );
      
      // Since we're in development without actual Stripe integration,
      // simulate successful subscription update
      if (process.env.NODE_ENV === 'development') {
        // Simulate a successful upgrade
        alert('Development mode: Simulating successful subscription update');
        setCurrentPlan(plan);
        setSubscriptionDetails({
          active: true,
          plan: plan,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          canceled: false,
          subscriptionId: 'dev-subscription-id'
        });
        setIsLoading(false);
        return;
      }
      
      // Redirect to checkout in production
      window.location.href = checkoutUrl;
    } catch (err) {
      setError('Failed to process your request. Please try again.');
      console.error("Error selecting plan", err);
      setIsLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!currentUser || !subscriptionDetails?.subscriptionId) {
        setError('No active subscription found');
        setIsLoading(false);
        return;
      }
      
      // In development, simulate cancellation
      if (process.env.NODE_ENV === 'development') {
        // Simulate successful cancellation
        setTimeout(() => {
          setSubscriptionDetails({
            ...subscriptionDetails,
            canceled: true
          });
          setCancelConfirm(false);
          trackEvent('subscription_cancelled');
          setIsLoading(false);
        }, 1000);
        return;
      }
      
      // In production, call actual cancel endpoint
      const success = await cancelSubscription(
        currentUser.uid, 
        subscriptionDetails.subscriptionId
      );
      
      if (success) {
        // Update subscription details
        const updatedStatus = await getSubscriptionStatus(currentUser.uid);
        setSubscriptionDetails(updatedStatus);
        trackEvent('subscription_cancelled');
      } else {
        setError('Failed to cancel subscription. Please try again or contact support.');
      }
      
      setCancelConfirm(false);
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred while cancelling your subscription.');
      console.error("Error cancelling subscription", err);
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
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-bold">Subscription</h2>
        <button
          onClick={() => setView('dashboard')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      
      {subscriptionDetails && subscriptionDetails.active && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="bg-blue-600 p-6 text-white">
            <h3 className="text-xl font-bold mb-1">Current Subscription</h3>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h4 className="text-lg font-semibold">
                  {currentPlan === 'premium' ? 'Premium Plan' : currentPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </h4>
                
                {subscriptionDetails.renewalDate && (
                  <p className="text-gray-600">
                    {subscriptionDetails.canceled 
                      ? `Access until ${new Date(subscriptionDetails.renewalDate).toLocaleDateString()}`
                      : `Renews on ${new Date(subscriptionDetails.renewalDate).toLocaleDateString()}`
                    }
                  </p>
                )}
                
                {subscriptionDetails.canceled && (
                  <div className="mt-2 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg inline-block">
                    Your subscription will not renew
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                {!subscriptionDetails.canceled && (
                  <button
                    onClick={() => setCancelConfirm(true)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Cancel Subscription
                  </button>
                )}
                
                {currentPlan !== 'premium' && (
                  <button
                    onClick={() => handleSelectPlan('premium', isAnnual)}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cancel Subscription?</h3>
            <p className="mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Keep Subscription
              </button>
              
              <button
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Processing...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center mb-12">
        <h3 className="text-xl font-bold mb-4">Choose the Right Plan for Your Business</h3>
        
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div 
            key={plan.plan}
            className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
              plan.isPopular ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            {plan.isPopular && (
              <div className="bg-blue-500 text-white py-1 px-6 text-sm font-bold text-center">
                MOST POPULAR
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">
                    ${isAnnual && plan.price > 0 ? (plan.annualPrice / 12).toFixed(2) : plan.price}
                  </span>
                  {plan.price > 0 && <span className="text-gray-500 ml-1">/month</span>}
                </div>
                
                {isAnnual && plan.price > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    Save ${(plan.price * 12 - plan.annualPrice).toFixed(2)} annually
                  </p>
                )}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSelectPlan(plan.plan, isAnnual)}
                disabled={isLoading || (currentPlan === plan.plan && !subscriptionDetails?.canceled)}
                className={`
                  w-full py-2 px-4 rounded-lg font-semibold
                  ${
                    currentPlan === plan.plan && !subscriptionDetails?.canceled
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : plan.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }
                  transition-colors
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                `}
              >
                {isLoading 
                  ? 'Processing...' 
                  : currentPlan === plan.plan && !subscriptionDetails?.canceled
                    ? 'Current Plan' 
                    : plan.plan === 'free' ? 'Downgrade to Free' : `Select ${plan.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Can I cancel my subscription at any time?</h4>
            <p className="text-gray-600 mt-1">
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">How do I switch between monthly and annual billing?</h4>
            <p className="text-gray-600 mt-1">
              You can switch your billing cycle when renewing your subscription. Contact our support team if you need to switch in the middle of your billing cycle.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Is there a free trial available?</h4>
            <p className="text-gray-600 mt-1">
              We offer a 14-day money-back guarantee. If you're not satisfied with your subscription, contact us within 14 days for a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionView;