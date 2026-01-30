import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    message?: string;
    fullScreen?: boolean;
    overlay?: boolean;
}

/**
 * Loading Spinner Component
 * 
 * Features:
 * - Multiple sizes (sm, md, lg, xl)
 * - Optional message
 * - Full screen mode
 * - Overlay mode
 * 
 * Usage:
 * <LoadingSpinner size="md" message="กำลังโหลดข้อมูล..." />
 * <LoadingSpinner fullScreen message="กำลังประมวลผล..." />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    fullScreen = false,
    overlay = false
}) => {
    // Size mapping
    const sizeClasses = {
        sm: 'h-6 w-6 border-2',
        md: 'h-12 w-12 border-3',
        lg: 'h-16 w-16 border-4',
        xl: 'h-24 w-24 border-4'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Spinner */}
            <div
                className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            />

            {/* Message */}
            {message && (
                <p className={`${textSizeClasses[size]} text-gray-700 font-medium`}>
                    {message}
                </p>
            )}
        </div>
    );

    // Full screen mode
    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    // Overlay mode
    if (overlay) {
        return (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                {spinner}
            </div>
        );
    }

    // Normal mode
    return (
        <div className="flex items-center justify-center py-8">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;

/**
 * Skeleton Loader Component
 * For better UX while loading content
 */
interface SkeletonProps {
    count?: number;
    height?: string;
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    count = 1,
    height = 'h-4',
    className = ''
}) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`${height} bg-gray-200 rounded animate-pulse ${className}`}
                />
            ))}
        </>
    );
};

/**
 * Card Skeleton Loader
 * For loading card-like content
 */
export const CardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <Skeleton height="h-6" className="w-3/4" />
            <Skeleton height="h-4" className="w-full" />
            <Skeleton height="h-4" className="w-5/6" />
            <div className="flex gap-2">
                <Skeleton height="h-8" className="w-20" />
                <Skeleton height="h-8" className="w-20" />
            </div>
        </div>
    );
};

/**
 * Table Skeleton Loader
 * For loading table content
 */
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
    rows = 5,
    columns = 4
}) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            height="h-10"
                            className={colIndex === 0 ? 'w-1/4' : 'flex-1'}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};
