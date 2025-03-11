// src/components/premium/EnhancedPdfExport.js
import React, { useState } from 'react';
import { generateEstimatePDF } from '../../services/enhancedPdfExport';

/**
 * Enhanced PDF Export component for Pro users
 * Allows generating professional PDF estimates with more customization options
 */
const EnhancedPdfExport = ({ 
  estimate, 
  metadata, 
  isUserPro = false,
  isPremium = false,
  onExport
}) => {
  const [includeBreakdown, setIncludeBreakdown] = useState(true);
  const [includeCompanyLogo, setIncludeCompanyLogo] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [notes, setNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [includeTerms, setIncludeTerms] = useState(true);
  const [terms, setTerms] = useState('Payment due within 30 days of invoice. All prices are subject to change if not accepted within 30 days.');
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // If user is not pro, show upgrade prompt
  if (!isUserPro) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Professional PDF Export</h3>
        <p className="text-gray-600 mb-4">
          Create beautifully formatted PDF estimates to share with clients.
          Customize with your logo and detailed project breakdowns.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Upgrade to Pro
        </button>
      </div>
    );
  }
  
  // Handle file upload for company logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCompanyLogo(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Prepare export options
      const exportOptions = {
        includeBreakdown,
        includeCompanyLogo,
        companyLogo,
        companyName: companyName || metadata.companyName || 'Your Company',
        includeNotes,
        notes,
        clientName,
        clientEmail,
        includeTerms,
        terms,
        whiteLabel: isPremium && whiteLabel // Only allow white-labeling for Premium users
      };
      
      // Generate PDF
      const pdfBlob = await generateEstimatePDF(estimate, metadata, exportOptions);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${metadata.projectName || 'Project'}_Estimate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Call the onExport callback
      if (onExport) {
        onExport({
          ...exportOptions,
          success: true
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError('Failed to generate PDF. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-green-600 px-6 py-4 text-white">
        <h3 className="font-bold text-lg">PDF Export Options</h3>
        <p className="text-green-100 text-sm">Create a professional PDF estimate to share with clients</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Company Information */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Company Information</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your company name"
              />
            </div>
            
            <div>
              <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700 mb-1">
                Company Logo
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeCompanyLogo"
                  checked={includeCompanyLogo}
                  onChange={(e) => setIncludeCompanyLogo(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeCompanyLogo" className="ml-2 block text-sm text-gray-700">
                  Include company logo
                </label>
              </div>
              
              {includeCompanyLogo && (
                <div className="mt-2">
                  <input
                    type="file"
                    id="companyLogo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {companyLogo && (
                    <div className="mt-2">
                      <img 
                        src={companyLogo} 
                        alt="Company logo preview" 
                        className="h-10 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Client Information */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Client Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Client name"
              />
            </div>
            
            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <input
                type="email"
                id="clientEmail"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="client@example.com"
              />
            </div>
          </div>
        </div>
        
        {/* Content Options */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Content Options</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeBreakdown"
                checked={includeBreakdown}
                onChange={(e) => setIncludeBreakdown(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeBreakdown" className="ml-2 block text-sm text-gray-700">
                Include detailed project breakdown
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeNotes"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeNotes" className="ml-2 block text-sm text-gray-700">
                Include notes for client
              </label>
            </div>
            
            {includeNotes && (
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes for Client
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional information or terms for your client..."
                ></textarea>
              </div>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeTerms"
                checked={includeTerms}
                onChange={(e) => setIncludeTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeTerms" className="ml-2 block text-sm text-gray-700">
                Include terms & conditions
              </label>
            </div>
            
            {includeTerms && (
              <div>
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add your terms and conditions..."
                ></textarea>
              </div>
            )}
            
            {/* White Label Option - Premium Feature */}
            {isPremium && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="whiteLabel"
                  checked={whiteLabel}
                  onChange={(e) => setWhiteLabel(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="whiteLabel" className="ml-2 block text-sm text-gray-700">
                  Remove BidRight branding (Premium feature)
                </label>
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isLoading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              'Export as PDF'
            )}
          </button>
          
          <button
            onClick={() => {
              // Reset all fields to defaults
              setCompanyName('');
              setCompanyLogo(null);
              setClientName('');
              setClientEmail('');
              setNotes('');
              setTerms('Payment due within 30 days of invoice. All prices are subject to change if not accepted within 30 days.');
              setIncludeBreakdown(true);
              setIncludeCompanyLogo(true);
              setIncludeNotes(true);
              setIncludeTerms(true);
              setWhiteLabel(false);
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Reset Options
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPdfExport;