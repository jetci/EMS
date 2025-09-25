import React from 'react';
import AlertTriangleIcon from '../icons/AlertTriangleIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-scale-in">
        <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 p-2 flex items-center justify-center mx-auto mb-4">
               <AlertTriangleIcon className="w-10 h-10 text-[#005A9C]" />
            </div>
            <h3 id="confirmation-title" className="text-xl font-bold text-gray-800">{title}</h3>
            <p id="confirmation-message" className="text-md text-gray-600 mt-2">{message}</p>
        </div>
        <div className="flex justify-center items-center p-4 bg-gray-50 border-t space-x-4">
          <button onClick={onClose} className="px-8 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-2.5 text-sm font-semibold text-white bg-[#005A9C] rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;