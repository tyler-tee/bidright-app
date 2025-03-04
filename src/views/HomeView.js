import React from 'react';

const HomeView = ({ setView, setMobileMenuOpen, savedEstimates, trackEvent }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">BidRight.app</h2>
      <p className="text-lg mb-8 text-center max-w-2xl">
        Stop undercharging for your freelance work. Get accurate project estimates 
        based on real industry data to price your services confidently and profitably.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-5xl">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <div className="text-3xl mb-4 text-blue-500">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Accurate Estimates</h3>
          <p>Generate realistic project timelines and costs based on industry benchmarks</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <div className="text-3xl mb-4 text-blue-500">💰</div>
          <h3 className="text-xl font-semibold mb-2">Increase Profits</h3>
          <p>Stop undercharging for your services with data-backed pricing guidance</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <div className="text-3xl mb-4 text-blue-500">🔄</div>
          <h3 className="text-xl font-semibold mb-2">Save Time</h3>
          <p>Create professional estimates in minutes instead of hours</p>
        </div>
      </div>
      
      <div className="flex gap-4 flex-wrap justify-center">
        <button 
          onClick={() => {
            setView('estimator');
            setMobileMenuOpen(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          Create Your First Estimate
        </button>
        
        {savedEstimates.length > 0 && (
          <button 
            onClick={() => {
              setView('saved');
              trackEvent('view_saved_estimates');
              setMobileMenuOpen(false);
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            View Saved Estimates ({savedEstimates.length})
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeView;