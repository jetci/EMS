import React from 'react';
import CheckCircleIcon from '../icons/CheckCircleIcon';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true" aria-labelledby="success-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in">
        <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 p-2 flex items-center justify-center mx-auto mb-4">
               <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 id="success-title" className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-md text-gray-600 mt-2">{message}</p>
        </div>
        <div className="flex justify-center items-center p-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full px-8 py-2.5 text-sm font-semibold text-white bg-[#28A745] rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
