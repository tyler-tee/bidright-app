import React, { useState, useEffect } from 'react';

const CookieBanner = ({ setView, trackEvent }) => {
  const [showBanner, setShowBanner] = useState(true);
  
  useEffect(() => {
    const consentGiven = localStorage.getItem('cookieConsent');
    if (consentGiven) {
      setShowBanner(false);
    }
  }, []);
  
  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowBanner(false);
    trackEvent('cookie_consent_accepted');
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm">
          <p>We use cookies to improve your experience on our site. By continuing to use BidRight.app, you consent to our use of cookies.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView('privacy')}
            className="text-sm text-blue-300 hover:text-blue-100"
          >
            Privacy Policy
          </button>
          <button 
            onClick={acceptCookies}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;