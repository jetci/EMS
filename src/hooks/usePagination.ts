/**
 * usePagination Hook
 * Custom hook for managing pagination state
 */

import { useState, useCallback } from 'react';
import { PaginationState, PaginationMeta, createInitialPaginationState, metaToState } from '../types-dir/pagination';

interface UsePaginationReturn {
    pagination: PaginationState;
    currentPage: number;
    setPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    updatePagination: (meta: PaginationMeta) => void;
    resetPagination: () => void;
}

export const usePagination = (initialPage: number = 1): UsePaginationReturn => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pagination, setPagination] = useState<PaginationState>(createInitialPaginationState());

    const setPage = useCallback((page: number) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const nextPage = useCallback(() => {
        if (pagination.hasNext) {
            setPage(currentPage + 1);
        }
    }, [currentPage, pagination.hasNext, setPage]);

    const prevPage = useCallback(() => {
        if (pagination.hasPrev) {
            setPage(currentPage - 1);
        }
    }, [currentPage, pagination.hasPrev, setPage]);

    const updatePagination = useCallback((meta: PaginationMeta) => {
        setPagination(metaToState(meta));
    }, []);

    const resetPagination = useCallback(() => {
        setCurrentPage(1);
        setPagination(createInitialPaginationState());
    }, []);

    return {
        pagination,
        currentPage,
        setPage,
        nextPage,
        prevPage,
        updatePagination,
        resetPagination
    };
};
