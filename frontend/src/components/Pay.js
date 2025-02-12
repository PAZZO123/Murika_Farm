import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-50 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const Pay = () => {
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    pin: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate payment processing
    setIsPaymentComplete(true);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const SuccessModal = () => (
    <Modal isOpen={showModal} onClose={handleCloseModal}>
      <div className="p-6">
        {/* Close button */}
        <button 
          onClick={handleCloseModal}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6">
            <img 
              src="/api/placeholder/120/40" 
              alt="Mulika Farms Logo" 
              className="h-10 object-contain"
            />
          </div>

          {/* Success Message */}
          <h2 className="text-orange-400 text-xl mb-6">Payment successful</h2>
          
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <p className="text-black text-center mb-6">
            Thank you for doing business with Mulika
          </p>

          {/* Close button */}
          <button
            onClick={handleCloseModal}
            className="w-full bg-orange-400 text-white py-3 rounded hover:bg-orange-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );

  if (isPaymentComplete && !showModal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <img 
            src="/api/placeholder/120/40" 
            alt="Mulika Farms Logo" 
            className="h-10 object-contain"
          />
        </div>
        <p className="text-center text-gray-600">Payment completed</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <img 
          src="/api/placeholder/120/40" 
          alt="Mulika Farms Logo" 
          className="h-10 object-contain"
        />
      </div>

      {/* Payment Form */}
      <div className="w-full max-w-md">
        <h2 className="text-orange-400 text-xl mb-6 text-center">
          Pay your bills to Mulika farms
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Phone number"
            className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:border-orange-400"
            required
          />

          <input
            type="password"
            name="pin"
            value={formData.pin}
            onChange={handleInputChange}
            placeholder="Pin code"
            className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:border-orange-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-orange-400 text-white py-3 rounded hover:bg-orange-500 transition-colors"
          >
            Initiate Payment
          </button>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal />
    </div>
  );
};

export default Pay;