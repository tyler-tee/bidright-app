// src/components/Header.js
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ 
  view, 
  setView, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  savedEstimates, 
  handleAccountAction,
  trackEvent,
  isLoggedIn,
  userName
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      trackEvent('user_logout');
      setView('home');
      setDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-sm" role="banner">
      <div className="max-w-6xl mx-auto py-4 px-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between">
          <h1 
            className="text-xl font-bold text-blue-800 cursor-pointer" 
            onClick={() => {
              setView('home');
              setMobileMenuOpen(false);
            }}
          >
            BidRight.app
          </h1>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0`}>
          {/* Always show Estimate button */}
          <button 
            className="text-gray-600 hover:text-gray-800 font-medium w-full md:w-auto text-center"
            onClick={() => {
              setView('estimator');
              trackEvent('start_new_estimate');
              setMobileMenuOpen(false);
            }}
          >
            New Estimate
          </button>
          
          {isLoggedIn ? (
            // Logged in menu items
            <>
              {savedEstimates.length > 0 && (
                <button 
                  className="text-gray-600 hover:text-gray-800 font-medium w-full md:w-auto text-center"
                  onClick={() => {
                    setView('saved');
                    trackEvent('view_saved_estimates');
                    setMobileMenuOpen(false);
                  }}
                >
                  My Estimates ({savedEstimates.length})
                </button>
              )}
              
              {/* Desktop Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 w-full md:w-auto text-center"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span>{userName || 'Account'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown menu with absolute positioning */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setView('dashboard');
                        trackEvent('view_dashboard');
                        setDropdownOpen(false);
                      }}
                    >
                      Dashboard
                    </button>
                    
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => {
                        setView('account');
                        trackEvent('view_account_settings');
                        setDropdownOpen(false);
                      }}
                    >
                      Account Settings
                    </button>
                    
                    <button
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile menu items (when menu is open) */}
              <div className="md:hidden w-full">
                {mobileMenuOpen && (
                  <div className="mt-2 pt-2 border-t border-gray-200 w-full">
                    <button
                      className="block py-2 text-blue-600 font-medium w-full text-left"
                      onClick={() => {
                        setView('dashboard');
                        trackEvent('view_dashboard');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </button>
                    
                    <button
                      className="block py-2 text-blue-600 font-medium w-full text-left"
                      onClick={() => {
                        setView('account');
                        trackEvent('view_account_settings');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Account Settings
                    </button>
                    
                    <button
                      className="block py-2 text-red-600 font-medium w-full text-left"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Not logged in menu items
            <>
              {savedEstimates.length > 0 && (
                <button 
                  className="text-gray-600 hover:text-gray-800 font-medium w-full md:w-auto text-center"
                  onClick={() => {
                    setView('saved');
                    trackEvent('view_saved_estimates');
                    setMobileMenuOpen(false);
                  }}
                >
                  My Estimates ({savedEstimates.length})
                </button>
              )}
              
              <button 
                className="text-blue-600 hover:text-blue-800 font-medium w-full md:w-auto text-center"
                onClick={() => handleAccountAction('Login')}
              >
                Login
              </button>
              
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full md:w-auto"
                onClick={() => handleAccountAction('Sign Up')}
              >
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;