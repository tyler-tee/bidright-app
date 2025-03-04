import React from 'react';

const Footer = ({ setView, setMobileMenuOpen }) => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 px-4" role="contentinfo">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">BidRight.app</h3>
            <p className="text-sm">
              The smart way to price your freelance projects and boost your profits.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm">
              <li>Project Estimation</li>
              <li>Cost Calculator</li>
              <li>Timeline Planner</li>
              <li>Proposal Generator</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>Pricing Guide</li>
              <li>Freelance Blog</li>
              <li>Case Studies</li>
              <li>Support Center</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li 
                className="cursor-pointer hover:text-white" 
                onClick={() => { 
                  setView('terms'); 
                  setMobileMenuOpen(false); 
                }}
              >
                Terms of Service
              </li>
              <li 
                className="cursor-pointer hover:text-white" 
                onClick={() => { 
                  setView('privacy'); 
                  setMobileMenuOpen(false); 
                }}
              >
                Privacy Policy
              </li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-center">
          &copy; {new Date().getFullYear()} BidRight.app. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;