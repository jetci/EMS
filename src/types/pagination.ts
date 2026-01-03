/**
 * Pagination Types for EMS WeCare Frontend
 * Matches backend pagination response format
 */

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Create initial pagination state
 */
export const createInitialPaginationState = (): PaginationState => ({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
});

/**
 * Convert PaginationMeta to PaginationState
 */
export const metaToState = (meta: PaginationMeta): PaginationState => ({
    currentPage: meta.page,
    itemsPerPage: meta.limit,
    totalItems: meta.total,
    totalPages: meta.totalPages,
    hasNext: meta.hasNext,
    hasPrev: meta.hasPrev,
});

/**
 * Build query string from pagination params
 */
export const buildPaginationQuery = (params?: PaginationParams): string => {
    if (!params) return '';

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return query ? `?${query}` : '';
};
