// src/components/premium/PdfExport.js
import React, { useState } from 'react';
import { formatCurrency, formatDate, generateEstimateSummary } from '../../utils/formatters';

/**
 * PDF Export component for Pro users
 * Allows generating professional PDF estimates
 */
const PdfExport = ({ 
  estimate, 
  metadata, 
  isUserPro = false,
  onExport
}) => {
  const [includeBreakdown, setIncludeBreakdown] = useState(true);
  const [includeCompanyLogo, setIncludeCompanyLogo] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // If user is not premium, show upgrade prompt
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
  
  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would call a backend API to generate the PDF
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the onExport callback
      if (onExport) {
        onExport({
          includeBreakdown,
          includeCompanyLogo,
          includeNotes,
          notes
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-green-600 px-6 py-4 text-white">
        <h3 className="font-bold text-lg">PDF Export Options</h3>
        <p className="text-green-100 text-sm">Create a professional PDF estimate to share with clients</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 mb-6">
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
              id="includeCompanyLogo"
              checked={includeCompanyLogo}
              onChange={(e) => setIncludeCompanyLogo(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeCompanyLogo" className="ml-2 block text-sm text-gray-700">
              Include your company logo (if set in account settings)
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
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isLoading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Generating PDF...' : 'Export as PDF'}
          </button>
          
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfExport;