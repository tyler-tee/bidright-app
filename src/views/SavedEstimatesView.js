import React from 'react';

const SavedEstimatesView = ({ savedEstimates, setSavedEstimates, setView, setMobileMenuOpen }) => {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Delete a saved estimate
  const deleteEstimate = (id) => {
    try {
      const updatedEstimates = savedEstimates.filter(est => est.id !== id);
      setSavedEstimates(updatedEstimates);
      localStorage.setItem('freelanceEstimates', JSON.stringify(updatedEstimates));
    } catch (error) {
      console.error("Error deleting estimate:", error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Saved Estimates</h2>
        <button
          onClick={() => {
            setView('estimator');
            setMobileMenuOpen(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Create New Estimate
        </button>
      </div>
      
      {savedEstimates.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">You don't have any saved estimates yet.</p>
          <button
            onClick={() => {
              setView('estimator');
              setMobileMenuOpen(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Create Your First Estimate
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {savedEstimates.map((est) => (
            <div key={est.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4 text-white">
                <h3 className="font-semibold">{est.industryName} - {est.projectName}</h3>
                <p className="text-sm text-blue-100">Created: {formatDate(est.created)}</p>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <span className="text-gray-500 text-sm">Time: </span>
                    <span className="font-medium">{est.hourRange.min}-{est.hourRange.max} hours</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Cost: </span>
                    <span className="font-medium">{formatCurrency(est.costRange.min)}-{formatCurrency(est.costRange.max)}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Complexity: </span>
                    <span className="font-medium">{est.complexityName}</span>
                  </div>
                </div>
                
                {est.featuresSelected && est.featuresSelected.length > 0 && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">Features: </span>
                    <span className="font-medium">{est.featuresSelected.join(', ')}</span>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => deleteEstimate(est.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedEstimatesView;