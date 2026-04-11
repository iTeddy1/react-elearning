// Common utility types
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type SortOrder = 'asc' | 'desc';

export type Language = 'en' | 'vi';

// UI State types
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface FilterState {
  difficulty: string;
  topic: string;
  sortBy: string;
  sortOrder: SortOrder;
}

// Date utility types
export type DateString = string; // ISO date string
export type Timestamp = number; // Unix timestamp

// Response wrapper types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
