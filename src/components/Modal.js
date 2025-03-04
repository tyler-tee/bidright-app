import React from 'react';

const Modal = ({ showModal, setShowModal, modalContent, email, setEmail, handleSubscribe }) => {
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">{modalContent.title}</h3>
        <p className="mb-6">{modalContent.message}</p>
        
        {modalContent.title === 'Coming Soon' && (
          <div className="mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSubscribe}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full transition-colors"
            >
              Notify Me
            </button>
          </div>
        )}
        
        <button
          onClick={() => setShowModal(false)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg w-full transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;