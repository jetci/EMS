/**
 * Pagination Component
 * Beautiful and responsive pagination UI
 */

import React from 'react';
import { PaginationMeta } from '../../src/types/pagination';

interface PaginationProps {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    pagination,
    onPageChange,
    className = ''
}) => {
    const { page, totalPages, hasNext, hasPrev, total, limit } = pagination;

    // Calculate showing range
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    // Don't show pagination if only 1 page or no data
    if (totalPages <= 1) return null;

    // Generate page numbers to show (max 7 pages)
    const getPageNumbers = (): number[] => {
        const pages: number[] = [];
        const maxPages = 7;

        if (totalPages <= maxPages) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first, last, and pages around current
            if (page <= 4) {
                // Near start
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push(-1); // Ellipsis
                pages.push(totalPages);
            } else if (page >= totalPages - 3) {
                // Near end
                pages.push(1);
                pages.push(-1); // Ellipsis
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                // Middle
                pages.push(1);
                pages.push(-1); // Ellipsis
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push(-2); // Ellipsis
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${className}`}>
            {/* Info */}
            <div className="text-sm text-gray-600">
                แสดง <span className="font-semibold text-gray-900">{startItem}</span> ถึง{' '}
                <span className="font-semibold text-gray-900">{endItem}</span> จาก{' '}
                <span className="font-semibold text-gray-900">{total}</span> รายการ
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrev}
                    className={`
            px-3 py-2 rounded-lg border border-gray-300 font-medium
            transition-all duration-200
            ${hasPrev
                            ? 'hover:bg-gray-50 hover:border-gray-400 text-gray-700'
                            : 'cursor-not-allowed opacity-40 text-gray-400'
                        }
          `}
                    aria-label="Previous page"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {pageNumbers.map((pageNum, index) => {
                        if (pageNum === -1 || pageNum === -2) {
                            // Ellipsis
                            return (
                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`
                  px-3 py-2 rounded-lg font-medium min-w-[40px]
                  transition-all duration-200
                  ${pageNum === page
                                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-300'
                                    }
                `}
                                aria-label={`Page ${pageNum}`}
                                aria-current={pageNum === page ? 'page' : undefined}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                {/* Mobile: Current Page Indicator */}
                <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700">
                    หน้า {page} / {totalPages}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNext}
                    className={`
            px-3 py-2 rounded-lg border border-gray-300 font-medium
            transition-all duration-200
            ${hasNext
                            ? 'hover:bg-gray-50 hover:border-gray-400 text-gray-700'
                            : 'cursor-not-allowed opacity-40 text-gray-400'
                        }
          `}
                    aria-label="Next page"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination;
