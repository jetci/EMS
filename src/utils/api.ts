/**
 * API Helper - รวมฟังก์ชันเรียก API ผ่าน Proxy
 * ใช้งาน: import { fetchNews, fetchNewsItem, login, fetchCommunityStats, fetchDriverJobs, fetchOfficeStats, testApiConnection } from './utils/api';
 */

/**
 * ดึง base URL ของ API Proxy
 */
const getApiBase = (): string => {
  const viteEnv = (import.meta as any).env?.VITE_API_BASE_URL;
  const runtime = (window as any).__API_BASE__ || viteEnv || '/api';
  return runtime.replace(/\/api\/?$/i, '');
};

/**
 * Helper สำหรับ fetch with error handling
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getApiBase()}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
};

/**
 * ดึงรายการข่าว
 */
export const fetchNews = async () => {
  return apiFetch('news.php');
};

/**
 * ดึงข่าวแต่ละรายการ
 */
export const fetchNewsItem = async (id: string | number) => {
  return apiFetch(`news_item.php?id=${id}`);
};

/**
 * Login
 */
export const login = async (username: string, password: string) => {
  return apiFetch('auth.php', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

/**
 * Community Stats
 */
export const fetchCommunityStats = async () => {
  return apiFetch('community_stats.php');
};

/**
 * Driver Jobs
 */
export const fetchDriverJobs = async () => {
  return apiFetch('driver_jobs.php');
};

/**
 * Office Stats
 */
export const fetchOfficeStats = async () => {
  return apiFetch('office_stats.php');
};

/**
 * ทดสอบการเชื่อมต่อ API
 */
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${getApiBase()}/news.php`);
    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'API Connected' : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Connection failed',
    };
  }
};
