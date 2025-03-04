import React from 'react';

const Header = ({ 
  view, 
  setView, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  savedEstimates, 
  handleAccountAction,
  trackEvent 
}) => {
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
          {savedEstimates.length > 0 && (
            <button 
              className="text-blue-600 hover:text-blue-800 font-medium w-full md:w-auto text-center"
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
        </div>
      </div>
    </header>
  );
};

export default Header;