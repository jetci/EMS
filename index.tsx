import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Runtime + build-time base path detection
// - Production root: ''
// - Staging subdir: '/ems_staging'
const getBasePath = (): string => {
  const path = window.location.pathname;
  // 1) Build-time base from Vite if provided and not root
  const baseFromEnv = (import.meta as any)?.env?.BASE_URL as string | undefined;
  if (baseFromEnv && baseFromEnv !== '/') {
    return baseFromEnv.replace(/\/$/, '');
  }
  // 2) Runtime detection
  if (path.startsWith('/ems_staging')) return '/ems_staging';
  // 3) Default root
  return '';
};

const basePath = getBasePath();
(window as any).__BASE_PATH__ = basePath;
(window as any).__API_BASE__ = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

if ((import.meta as any)?.env?.DEV) {
  console.log('[Router] Base Path:', basePath);
  console.log('[Router] API Base:', (window as any).__API_BASE__);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
