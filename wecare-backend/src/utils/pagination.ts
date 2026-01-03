/**
 * Pagination utilities for EMS WeCare
 * Provides consistent pagination across all API endpoints
 */

export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

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

/**
 * Parse pagination parameters from query string
 * @param query - Express request query object
 * @returns Parsed pagination parameters
 */
export const parsePaginationParams = (query: any): PaginationParams => {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20)); // Max 100 items per page
    const offset = (page - 1) * limit;

    return { page, limit, offset };
};

/**
 * Create pagination metadata
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata
 */
export const createPaginationMeta = (
    page: number,
    limit: number,
    total: number
): PaginationMeta => {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

/**
 * Create paginated response
 * @param data - Array of data items
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Paginated response object
 */
export const createPaginatedResponse = <T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): PaginatedResponse<T> => {
    return {
        data,
        pagination: createPaginationMeta(page, limit, total)
    };
};

/**
 * Build SQL LIMIT and OFFSET clause
 * @param params - Pagination parameters
 * @returns SQL clause string
 */
export const buildPaginationSQL = (params: PaginationParams): string => {
    return `LIMIT ${params.limit} OFFSET ${params.offset}`;
};

/**
 * Validate pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @throws Error if parameters are invalid
 */
export const validatePaginationParams = (page: number, limit: number): void => {
    if (page < 1) {
        throw new Error('Page number must be greater than 0');
    }

    if (limit < 1) {
        throw new Error('Limit must be greater than 0');
    }

    if (limit > 100) {
        throw new Error('Limit cannot exceed 100 items per page');
    }
};
