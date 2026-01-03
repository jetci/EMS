/**
 * Loading Spinner Component
 * Beautiful loading indicator with optional text
 */

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    text = 'กำลังโหลด...',
    fullScreen = false,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-4',
        lg: 'w-16 h-16 border-4',
        xl: 'w-24 h-24 border-4'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const containerClasses = fullScreen
        ? 'fixed inset-0 bg-white bg-opacity-90 z-50'
        : '';

    return (
        <div className={`${containerClasses} flex flex-col items-center justify-center p-8 ${className}`}>
            {/* Spinner */}
            <div
                className={`
          ${sizeClasses[size]} 
          animate-spin rounded-full 
          border-gray-200 border-t-blue-600
        `}
                role="status"
                aria-label="Loading"
            />

            {/* Text */}
            {text && (
                <p className={`mt-4 text-gray-600 ${textSizeClasses[size]} font-medium`}>
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
