/**
 * Standard API response wrapper from NestJS backend
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

/**
 * API error response from NestJS backend
 */
export interface ApiError {
  message: string | string[];
  error?: string;
  statusCode: number;
}

/**
 * Pagination params for list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated response from backend
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
