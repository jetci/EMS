import React from 'react';

interface ReportCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
    actionButtonText: string;
    onActionClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, children, actionButtonText, onActionClick, isLoading = false, disabled = false, icon: Icon }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="flex-grow">
                 <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-6 h-6 text-gray-500" />}
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                </div>
                <p className="text-sm text-gray-600 mt-2 mb-6">{description}</p>
                
                {/* Controls Section */}
                <div className="space-y-4">
                    {children}
                </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                    onClick={onActionClick}
                    disabled={disabled || isLoading}
                    className="w-full flex items-center justify-center px-4 py-2.5 font-semibold text-white bg-[var(--wecare-blue)] rounded-lg shadow-sm hover:bg-blue-800 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span>กำลังสร้าง...</span>
                        </>
                    ) : (
                        actionButtonText
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReportCard;
