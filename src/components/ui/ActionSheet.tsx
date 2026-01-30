import React from 'react';

interface ActionOption {
    label: string;
    onClick: () => void;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface ActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    options: ActionOption[];
}

const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose, title, options }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-labelledby={title ? "action-sheet-title" : undefined}>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" 
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Panel */}
            <div className="relative w-full bg-gray-100 rounded-t-2xl shadow-xl transition-transform duration-300 transform translate-y-0 animate-slide-up">
                <div className="p-4">
                    {title && <h3 id="action-sheet-title" className="text-center text-sm font-semibold text-gray-500 mb-3">{title}</h3>}
                    
                    <div className="bg-white rounded-xl shadow-sm">
                        {options.map((option, index) => (
                            <button
                                key={option.label}
                                onClick={option.onClick}
                                className={`w-full text-left text-lg text-blue-600 p-4 flex items-center ${index < options.length - 1 ? 'border-b border-gray-200' : ''}`}
                            >
                                {option.icon && <option.icon className="w-6 h-6 mr-4 text-gray-600" />}
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-3">
                         <button
                            onClick={onClose}
                            className="w-full text-lg font-semibold text-blue-600 p-4 bg-white rounded-xl shadow-sm"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionSheet;
