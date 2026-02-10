import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/tailwind.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

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
// ในโหมดพัฒนา ให้ใช้ '/api' เสมอเพื่อผ่าน Vite proxy ไปยัง mock server
const isDev = (import.meta as any)?.env?.DEV;
(window as any).__API_BASE__ = isDev ? '/api' : ((import.meta as any).env?.VITE_API_BASE_URL || '/api');

// Debug log (เฉพาะ development)
if ((import.meta as any)?.env?.DEV) {
  console.log('[Router] Base Path:', basePath);
  console.log('[Router] API Base:', (window as any).__API_BASE__);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename={basePath}>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
