import React, { useState, useEffect } from 'react';

const WelcomeGuide = ({ view, trackEvent }) => {
  const [showGuide, setShowGuide] = useState(true);
  
  useEffect(() => {
    const guideSeen = localStorage.getItem('welcomeGuideSeen');
    if (guideSeen) {
      setShowGuide(false);
    }
  }, []);
  
  const dismissGuide = () => {
    localStorage.setItem('welcomeGuideSeen', 'true');
    setShowGuide(false);
    trackEvent('welcome_guide_dismissed');
  };
  
  if (!showGuide || view !== 'home') return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">Welcome to BidRight.app!</h3>
        <p className="mb-4">Stop undercharging for your freelance work with data-backed project estimates.</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start">
            <span className="text-blue-600 mr-2">1.</span>
            <p>Select your industry and project type</p>
          </div>
          <div className="flex items-start">
            <span className="text-blue-600 mr-2">2.</span>
            <p>Choose your project complexity</p>
          </div>
          <div className="flex items-start">
            <span className="text-blue-600 mr-2">3.</span>
            <p>Add any special features you'll provide</p>
          </div>
          <div className="flex items-start">
            <span className="text-blue-600 mr-2">4.</span>
            <p>Get your professional estimate in seconds!</p>
          </div>
        </div>
        
        <button
          onClick={dismissGuide}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeGuide;