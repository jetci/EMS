import React from 'react';
import { ShiftStatus } from '../../types';

interface ShiftStatusSelectorProps {
    onSelect: (status: ShiftStatus) => void;
    onClose: () => void;
    position: { x: number; y: number };
}

const ShiftStatusSelector: React.FC<ShiftStatusSelectorProps> = ({ onSelect, onClose, position }) => {
    const statuses = Object.values(ShiftStatus);
    
    const handleSelect = (status: ShiftStatus) => {
        onSelect(status);
        onClose();
    };

    return (
        <div
            className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-2 space-y-1 popover-content"
            style={{ top: position.y, left: position.x }}
        >
            {statuses.map(status => (
                <button
                    key={status}
                    onClick={() => handleSelect(status)}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                    {status}
                </button>
            ))}
             <div className="border-t my-1"></div>
             <button
                onClick={onClose}
                className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
                ยกเลิก
            </button>
        </div>
    );
};

export default ShiftStatusSelector;