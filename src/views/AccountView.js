// src/views/AccountView.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../firebase';

const AccountView = ({ setView, trackEvent }) => {
  const { currentUser, userDetails, fetchUserDetails } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      
      if (userDetails) {
        setCompany(userDetails.company || '');
      }
    }
  }, [currentUser, userDetails]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      // Update display name in Firebase Auth
      await updateProfile(currentUser, { displayName });
      
      // Update user details in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName,
        company,
        updatedAt: new Date().toISOString()
      });
      
      // Track event
      trackEvent('profile_updated');
      
      // Refresh user details
      await fetchUserDetails(currentUser.uid);
      
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <button
          onClick={() => setView('dashboard')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold">Profile Information</h3>
        </div>
        
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={currentUser?.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  placeholder="Your company name (optional)"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(currentUser?.displayName || '');
                    setCompany(userDetails?.company || '');
                  }}
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                <p className="mt-1">{currentUser?.displayName || 'Not set'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p className="mt-1">{currentUser?.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Company</h4>
                <p className="mt-1">{userDetails?.company || 'Not set'}</p>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold">Subscription</h3>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {userDetails?.isSubscribed ? 'Premium Plan' : 'Free Plan'}
              </p>
              
              {userDetails?.isSubscribed && userDetails?.subscriptionEndDate && (
                <p className="text-sm text-gray-500 mt-1">
                  Renews on {new Date(userDetails.subscriptionEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <button
              onClick={() => {
                setView('subscription');
                trackEvent('view_subscription_page_from_account');
              }}
              className={`${
                userDetails?.isSubscribed 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } font-medium py-2 px-4 rounded-lg transition-colors`}
            >
              {userDetails?.isSubscribed ? 'Manage Subscription' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold">Security</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-gray-500 mt-1">
                Update your password to keep your account secure
              </p>
            </div>
            
            <button
              onClick={() => {
                setView('resetPassword');
                trackEvent('password_reset_from_account');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountView;