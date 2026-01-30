/**
 * API Client with Retry Logic
 * Handles API requests with automatic retry on failure
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { __retryCount?: number };

    // Don't retry if no config
    if (!config) {
      return Promise.reject(error);
    }

    // Initialize retry count
    config.__retryCount = config.__retryCount || 0;

    // Max retry attempts
    const MAX_RETRIES = 3;

    // Don't retry if max retries reached
    if (config.__retryCount >= MAX_RETRIES) {
      console.error('Max retries reached:', error.message);
      return Promise.reject(error);
    }

    // Determine if we should retry
    const shouldRetry = shouldRetryRequest(error);

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    // Increment retry count
    config.__retryCount += 1;

    // Calculate delay with exponential backoff
    const delay = calculateRetryDelay(config.__retryCount);

    console.log(
      `Retrying request (${config.__retryCount}/${MAX_RETRIES}) after ${delay}ms:`,
      config.url
    );

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry the request
    return apiClient(config);
  }
);

/**
 * Determine if request should be retried
 */
const shouldRetryRequest = (error: AxiosError): boolean => {
  // Network errors (no response)
  if (!error.response) {
    return true;
  }

  const status = error.response.status;

  // Retry on server errors (5xx)
  if (status >= 500 && status < 600) {
    return true;
  }

  // Retry on specific client errors
  if (status === 408 || status === 429) {
    // 408: Request Timeout
    // 429: Too Many Requests
    return true;
  }

  // Don't retry on other errors
  return false;
};

/**
 * Calculate retry delay with exponential backoff
 */
const calculateRetryDelay = (retryCount: number): number => {
  // Base delay: 1 second
  const baseDelay = 1000;

  // Exponential backoff: 1s, 2s, 4s
  const delay = baseDelay * Math.pow(2, retryCount - 1);

  // Add jitter (random 0-500ms) to prevent thundering herd
  const jitter = Math.random() * 500;

  return delay + jitter;
};

/**
 * Handle API errors with user-friendly messages
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Network error
    if (!error.response) {
      return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    }

    // Server error
    if (error.response.status >= 500) {
      return 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
    }

    // Client error
    if (error.response.data && typeof error.response.data === 'object') {
      const data = error.response.data as { error?: string; message?: string };
      return data.error || data.message || 'เกิดข้อผิดพลาด';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

/**
 * API request wrapper with error handling
 */
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
};

export default apiClient;
