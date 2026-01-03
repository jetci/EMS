/**
 * Empty State Component
 * Shows when no data is available
 */

import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title?: string;
    message?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title = 'ไม่พบข้อมูล',
    message = 'ยังไม่มีข้อมูลในระบบ',
    action,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
            {/* Icon */}
            {icon || (
                <svg
                    className="w-24 h-24 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
            )}

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {title}
            </h3>

            {/* Message */}
            <p className="text-gray-500 text-center mb-6 max-w-md">
                {message}
            </p>

            {/* Action Button */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
