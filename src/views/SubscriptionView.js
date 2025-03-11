// src/views/SubscriptionView.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSubscriptionStatus, cancelSubscription, resumeSubscription } from '../services/stripeService';
import EnhancedPlanCard from '../components/pricing/EnhancedPlanCard';
import StripeCallbackHandler from '../components/subscription/StripeCallbackHandler';

const SubscriptionView = ({ setView, trackEvent }) => {
  const { currentUser } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
  
  // Handle successful checkout
  const handleCheckoutSuccess = (status) => {
    setSuccess(`Your subscription to the ${status.plan} plan is now active!`);
    setCurrentPlan(status.plan);
    setSubscriptionDetails(status);
    
    // Scroll to top to show the success message
    window.scrollTo(0, 0);
  };
  
  // Handle checkout error
  const handleCheckoutError = (error) => {
    setError(`There was a problem with your subscription: ${error.message}`);
    
    // Scroll to top to show the error message
    window.scrollTo(0, 0);
  };
  
  // Handle plan selection
  const handleSelectPlan = async (plan, annual, action) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Track plan selection
      trackEvent('select_plan', { 
        plan, 
        billing_cycle: annual ? 'annual' : 'monthly',
        action
      });
      
      if (action === 'resume' && subscriptionDetails?.subscriptionId) {
        // Resume canceled subscription
        await resumeSubscription(currentUser.uid, subscriptionDetails.subscriptionId);
        
        // Refresh subscription status
        const updatedStatus = await getSubscriptionStatus(currentUser.uid);
        setSubscriptionDetails(updatedStatus);
        
        setSuccess('Your subscription has been resumed successfully.');
        setCancelConfirm(false);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to process your request. Please try again.');
      console.error("Error handling plan selection:", err);
      setIsLoading(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      if (!currentUser || !subscriptionDetails?.subscriptionId) {
        setError('No active subscription found');
        setIsLoading(false);
        return;
      }
      
      // Cancel subscription at period end
      await cancelSubscription(currentUser.uid, subscriptionDetails.subscriptionId);
      
      // Refresh subscription status
      const updatedStatus = await getSubscriptionStatus(currentUser.uid);
      setSubscriptionDetails(updatedStatus);
      
      // Track cancellation
      trackEvent('subscription_cancelled', {
        plan: currentPlan,
        reason: 'user_initiated'
      });
      
      setSuccess('Your subscription has been canceled. You will continue to have access until the end of your current billing period.');
      setCancelConfirm(false);
      setIsLoading(false);
    } catch (err) {
      setError('An error occurred while cancelling your subscription.');
      console.error("Error cancelling subscription:", err);
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
      price: 4.99,
      annualPrice: 49.99,
      isPopular: true,
      features: [
        'All Free features',
        'Unlimited saved estimates',
        'Detailed project breakdowns',
        'Risk assessment for project types',
        'PDF export with professional formatting',
        'White-label estimates',
        'Profitability analysis',
        'Client management system',
        'Contract templates',
        'Priority email support'
      ]
    }
  ];
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Stripe Callback Handler */}
      <StripeCallbackHandler 
        onSuccess={handleCheckoutSuccess} 
        onError={handleCheckoutError} 
        trackEvent={trackEvent} 
      />
      
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-3xl font-bold">Subscription</h2>
        <button
          onClick={() => setView('dashboard')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      
      {/* Success and Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-8">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}
      
      {/* Current Subscription Banner */}
      {subscriptionDetails && subscriptionDetails.active && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="bg-blue-600 p-6 text-white">
            <h3 className="text-xl font-bold mb-1">Current Subscription</h3>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h4 className="text-lg font-semibold">
                  {currentPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
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
                {!subscriptionDetails.canceled ? (
                  <button
                    onClick={() => setCancelConfirm(true)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(currentPlan, isAnnual, 'resume')}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Resume Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancellation Confirmation Modal */}
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
      
      {/* Plan Selection */}
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
              Save 16%
            </span>
          </button>
        </div>
      </div>
      
      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
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
      
      {/* FAQ Section */}
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