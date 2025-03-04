import React from 'react';

const TermsView = ({ setView, setMobileMenuOpen }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Terms of Service</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="prose max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h3>
          <p>Welcome to BidRight.app. By using our website and services, you agree to these Terms of Service in full. If you disagree with any part of these terms, please do not use our website or services.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">2. Intellectual Property Rights</h3>
          <p>Unless otherwise stated, we own the intellectual property rights for all material on BidRight.app. All intellectual property rights are reserved.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3. Restrictions</h3>
          <p>You are specifically restricted from:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Publishing any material from BidRight.app in any other media without our express permission</li>
            <li>Selling, sublicensing and/or otherwise commercializing any material from BidRight.app</li>
            <li>Using this website in any way that causes, or may cause, damage to the website or impairment of its availability</li>
            <li>Using this website in any way that is unlawful, illegal, fraudulent or harmful</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">4. No Warranties</h3>
          <p>This website is provided "as is," with all faults, and we express no representations or warranties of any kind related to this website or the materials contained on this website.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">5. Limitation of Liability</h3>
          <p>In no event shall we be held liable for anything arising out of or in any way connected with your use of this website.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">6. Indemnification</h3>
          <p>You hereby indemnify us to the fullest extent from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">7. Severability</h3>
          <p>If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">8. Variation of Terms</h3>
          <p>We are permitted to revise these Terms at any time as we see fit, and by using this website you are expected to review these Terms on a regular basis.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">9. Governing Law & Jurisdiction</h3>
          <p>These Terms will be governed by and interpreted in accordance with the laws of the United States, and you submit to the non-exclusive jurisdiction of the state and federal courts for the resolution of any disputes.</p>
        </div>
      </div>
      
      <button
        onClick={() => {
          setView('home');
          setMobileMenuOpen(false);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
};

export default TermsView;