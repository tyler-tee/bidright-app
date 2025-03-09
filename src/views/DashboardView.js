// src/views/DashboardView.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardView = ({ setView, trackEvent, savedEstimates }) => {
  const { currentUser, userDetails, logout } = useAuth();
  const [error, setError] = useState('');
  
  // Handle logout
  async function handleLogout() {
    try {
      setError('');
      await logout();
      trackEvent('user_logout');
      setView('home');
    } catch (error) {
      setError('Failed to log out. Please try again.');
      console.error('Logout error:', error);
    }
  }
  
  // Navigate to account page
  const goToAccount = () => {
    setView('account');
    trackEvent('view_account_settings');
  };
  
  // Navigate to saved estimates
  const goToSavedEstimates = () => {
    setView('saved');
    trackEvent('view_saved_estimates');
  };
  
  // Navigate to create estimate
  const goToCreateEstimate = () => {
    setView('estimator');
    trackEvent('start_new_estimate');
  };
  
  // Navigate to subscription page
  const goToSubscription = () => {
    setView('subscription');
    trackEvent('view_subscription_page');
  };
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Welcome, {currentUser?.displayName || 'User'}</h2>
      <p className="text-gray-600 mb-6">{currentUser?.email}</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-1">Subscription Status</h3>
          
          {userDetails?.isSubscribed ? (
            <div className="mt-2">
              <div className="flex items-center mb-2">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                  Active
                </span>
                <span>Premium Plan</span>
              </div>
              
              <button
                onClick={goToSubscription}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <div className="flex items-center mb-2">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                  Free
                </span>
                <span>Basic Plan</span>
              </div>
              
              <button
                onClick={goToSubscription}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-1">Your Estimates</h3>
          <p className="text-gray-600 mb-3">
            {savedEstimates.length} saved estimate{savedEstimates.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={goToSavedEstimates}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Saved Estimates
            </button>
            
            <button
              onClick={goToCreateEstimate}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Create New
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-1">Account</h3>
          <p className="text-gray-600 mb-3">
            Manage your account settings
          </p>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={goToAccount}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Account Settings
            </button>
            
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {!userDetails?.isSubscribed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold flex items-center text-yellow-800 mb-2">
            <span className="text-yellow-500 mr-2">⭐</span>
            Unlock Premium Features
          </h3>
          <p className="text-yellow-800 mb-3">
            Upgrade to access detailed project breakdowns, risk assessment, 
            competitor rate analysis, and more!
          </p>
          <button 
            onClick={goToSubscription}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors"
          >
            Upgrade Now for $9.99/month
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-lg">Recent Activity</h3>
        </div>
        
        {savedEstimates.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {savedEstimates.slice(0, 3).map((est) => (
              <div key={est.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{est.industryName} - {est.projectName}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(est.created).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${est.costRange.min}-${est.costRange.max}</p>
                    <p className="text-sm text-gray-500">{est.hourRange.min}-{est.hourRange.max} hours</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500 mb-4">You haven't created any estimates yet</p>
            <button
              onClick={goToCreateEstimate}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create Your First Estimate
            </button>
          </div>
        )}
        
        {savedEstimates.length > 3 && (
          <div className="bg-gray-50 px-6 py-3 text-center">
            <button
              onClick={goToSavedEstimates}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Estimates
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;