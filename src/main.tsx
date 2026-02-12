import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initSentry } from './config/sentry';

// Initialize Sentry before anything else
initSentry();

/**
 * ตรวจจับ base path อัตโนมัติ
 * - Production: '' (root domain)
 * - Staging: '/ems_staging'
 */
const getBasePath = (): string => {
  const path = window.location.pathname;

  // Environment variable มาก่อน (ถ้า build ด้วย VITE_BASE)
  const baseFromEnv = (import.meta as any)?.env?.BASE_URL as string | undefined;
  if (baseFromEnv && baseFromEnv !== '/') {
    return baseFromEnv.replace(/\/$/, ''); // เอา trailing slash ออก
  }

  // Runtime detection: ถ้า URL เริ่มด้วย /ems_staging
  if (path.startsWith('/ems_staging')) {
    return '/ems_staging';
  }

  // Default: root
  return '';
};

const basePath = getBasePath();

// ตั้งค่า global สำหรับใช้ใน components อื่น
(window as any).__BASE_PATH__ = basePath;
(window as any).__API_BASE__ = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Debug log (เฉพาะ development)
if ((import.meta as any)?.env?.DEV) {
  console.log('[Router] Base Path:', basePath);
  console.log('[Router] API Base:', (window as any).__API_BASE__);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
