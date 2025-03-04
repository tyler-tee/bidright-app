import React, { useState } from 'react';

const FeedbackButton = ({ trackEvent }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmitFeedback = () => {
    if (!feedbackType) {
      setError("Please select a feedback type");
      return;
    }
    
    // In a real app, you would send this to your backend
    console.log("Feedback submitted:", { feedbackType, feedbackText });
    
    // Track the feedback event
    trackEvent('feedback_submitted', { 
      type: feedbackType
    });
    
    setFeedbackSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setShowFeedback(false);
      setFeedbackSubmitted(false);
      setFeedbackType('');
      setFeedbackText('');
    }, 3000);
  };
  
  if (!showFeedback) {
    return (
      <button 
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg z-30"
        aria-label="Provide feedback"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg p-4 z-30 w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Share Your Feedback</h3>
        <button 
          onClick={() => setShowFeedback(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {feedbackSubmitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-green-800 font-medium">
            Thank you for your feedback!
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">What kind of feedback do you have?</p>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 text-sm rounded-full border ${feedbackType === 'suggestion' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-400'}`}
                onClick={() => setFeedbackType('suggestion')}
              >
                Suggestion
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-full border ${feedbackType === 'issue' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-400'}`}
                onClick={() => setFeedbackType('issue')}
              >
                Issue
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-full border ${feedbackType === 'compliment' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-400'}`}
                onClick={() => setFeedbackType('compliment')}
              >
                Compliment
              </button>
            </div>
          </div>
          
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us what you think..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          ></textarea>
          
          {error && (
            <div className="text-red-600 text-sm mb-3">
              {error}
            </div>
          )}
          
          <button
            onClick={handleSubmitFeedback}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg w-full transition-colors"
          >
            Submit Feedback
          </button>
        </>
      )}
    </div>
  );
};

export default FeedbackButton;