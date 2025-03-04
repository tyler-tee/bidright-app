import React from 'react';

const PrivacyView = ({ setView, setMobileMenuOpen }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Privacy Policy</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="prose max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h3>
          <p>At BidRight.app, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data and tell you about your privacy rights.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">2. Data We Collect</h3>
          <p>We may collect, use, store and transfer different kinds of personal data about you, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Identity Data: Includes first name, last name, username or similar identifier</li>
            <li>Contact Data: Includes email address</li>
            <li>Technical Data: Includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform</li>
            <li>Usage Data: Includes information about how you use our website and services</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Data</h3>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide you with the services you have requested</li>
            <li>To improve our website and services</li>
            <li>To send you marketing communications if you have opted in</li>
            <li>To comply with a legal or regulatory obligation</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h3>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">5. Data Retention</h3>
          <p>We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">6. Your Legal Rights</h3>
          <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Right to withdraw consent</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">7. Cookies</h3>
          <p>We use cookies to distinguish you from other users of our website, which helps us to provide you with a good experience and improves our site.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">8. Changes to the Privacy Policy</h3>
          <p>We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">9. Contact Us</h3>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at support@bidright.app.</p>
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

export default PrivacyView;