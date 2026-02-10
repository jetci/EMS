import { apiRequest, authAPI, clearCsrfToken } from '@/services/api';

// Ensure jsdom environment has FormData

describe('apiRequest and authAPI.uploadProfileImage', () => {
  const originalFetch = global.fetch as any;

  beforeEach(() => {
    jest.resetModules();
    clearCsrfToken();
    localStorage.clear();
  });

  afterEach(() => {
    (global.fetch as any) = originalFetch;
    jest.restoreAllMocks();
  });

  function makeJsonResponse(body: any, status = 200, statusText = 'OK') {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText,
      text: jest.fn().mockResolvedValue(JSON.stringify(body)),
      json: jest.fn().mockResolvedValue(body),
    } as any;
  }

  test('POST with JSON: includes Authorization, Content-Type and X-XSRF-TOKEN', async () => {
    localStorage.setItem('wecare_token', 'token-abc');

    const fetchMock = jest.fn(async (url: any, options: any) => {
      const u = String(url);
      if (u.includes('/api/csrf-token')) {
        return makeJsonResponse({ csrfToken: 'csrf-123' });
      }
      // main request
      expect(options).toBeDefined();
      expect(options.credentials).toBe('include');
      const headers = options.headers || {};
      expect(headers['Authorization']).toBe('Bearer token-abc');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-XSRF-TOKEN']).toBe('csrf-123');
      return makeJsonResponse({ success: true });
    });
    (global.fetch as any) = fetchMock;

    const result = await apiRequest('/test', {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
    });

    expect(result).toEqual({ success: true });
    // Ensure CSRF endpoint called first
    const firstCallUrl = String(fetchMock.mock.calls[0][0]);
    expect(firstCallUrl).toContain('/api/csrf-token');
    const secondCallUrl = String(fetchMock.mock.calls[1][0]);
    expect(secondCallUrl).toContain('/api/test');
  });

  test('POST with FormData: omits Content-Type, includes Authorization and X-XSRF-TOKEN', async () => {
    localStorage.setItem('wecare_token', 'token-xyz');

    const fetchMock = jest.fn(async (url: any, options: any) => {
      const u = String(url);
      if (u.includes('/api/csrf-token')) {
        return makeJsonResponse({ csrfToken: 'csrf-999' });
      }
      // main request for upload
      expect(options).toBeDefined();
      expect(options.credentials).toBe('include');
      const headers = options.headers || {};
      expect(headers['Authorization']).toBe('Bearer token-xyz');
      expect(headers['Content-Type']).toBeUndefined();
      expect(headers['X-XSRF-TOKEN']).toBe('csrf-999');
      // Body should be FormData
      expect(options.body instanceof FormData).toBe(true);
      return makeJsonResponse({ imageUrl: 'http://example.com/img.jpg' });
    });
    (global.fetch as any) = fetchMock;

    // Create a dummy file
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });

    const result = await authAPI.uploadProfileImage(file);
    expect(result).toEqual({ imageUrl: 'http://example.com/img.jpg' });

    // Ensure CSRF then upload endpoint
    const firstCallUrl = String(fetchMock.mock.calls[0][0]);
    expect(firstCallUrl).toContain('/api/csrf-token');
    const secondCallUrl = String(fetchMock.mock.calls[1][0]);
    expect(secondCallUrl).toContain('/api/auth/upload-profile-image');
  });

  test('GET request: does not include X-XSRF-TOKEN and does not call CSRF endpoint', async () => {
    localStorage.setItem('wecare_token', 'token-get');

    const fetchMock = jest.fn(async (url: any, options: any) => {
      // Single GET request
      expect(options).toBeDefined();
      expect(options.credentials).toBe('include');
      const headers = options.headers || {};
      expect(headers['Authorization']).toBe('Bearer token-get');
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-XSRF-TOKEN']).toBeUndefined();
      return makeJsonResponse({ ok: true });
    });
    (global.fetch as any) = fetchMock;

    const result = await apiRequest('/drivers');
    expect(result).toEqual({ ok: true });

    // Only one call, no CSRF token fetch
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const callUrl = String(fetchMock.mock.calls[0][0]);
    expect(callUrl).toContain('/api/drivers');
  });
});

describe('API base URL fallback', () => {
  const originalEnv = { ...process.env } as any;
  const originalWindowBase = (window as any).__BASE_PATH__;
  const originalFetch = global.fetch as any;

  beforeEach(() => {
    jest.resetModules();
    // Default fetch mock returns empty JSON
    (global.fetch as any) = jest.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: jest.fn().mockResolvedValue('{}'),
      json: jest.fn().mockResolvedValue({}),
    })) as any;

    delete (window as any).__BASE_PATH__;
    delete (process as any).env.VITE_API_BASE_URL;
    (process as any).env.NODE_ENV = 'test';
  });

  afterEach(() => {
    (process as any).env = { ...originalEnv };
    (window as any).__BASE_PATH__ = originalWindowBase;
    (global.fetch as any) = originalFetch;
    jest.restoreAllMocks();
  });

  it('uses VITE_API_BASE_URL in production', async () => {
    (process as any).env.VITE_API_BASE_URL = 'https://api.example.com';
    (process as any).env.NODE_ENV = 'production';

    let apiRequest: any;
    jest.isolateModules(() => {
      ({ apiRequest } = require('@/services/api'));
    });

    await apiRequest('/health');
    const callUrl = String(((global.fetch as any).mock.calls[0] || [])[0]);
    expect(callUrl).toBe('https://api.example.com/health');
  });

  it('uses window.__BASE_PATH__/api-proxy when runtime base present (dev)', async () => {
    (window as any).__BASE_PATH__ = 'http://localhost:5173';
    (process as any).env.NODE_ENV = 'development';

    let apiRequest: any;
    jest.isolateModules(() => {
      ({ apiRequest } = require('@/services/api'));
    });

    await apiRequest('/health');
    const callUrl = String(((global.fetch as any).mock.calls[0] || [])[0]);
    expect(callUrl).toBe('http://localhost:5173/api-proxy/health');
  });

  it('falls back to /api when no env or runtime base present (dev)', async () => {
    delete (process as any).env.VITE_API_BASE_URL;
    delete (window as any).__BASE_PATH__;
    (process as any).env.NODE_ENV = 'development';

    let apiRequest: any;
    jest.isolateModules(() => {
      ({ apiRequest } = require('@/services/api'));
    });

    await apiRequest('/health');
    const callUrl = String(((global.fetch as any).mock.calls[0] || [])[0]);
    expect(callUrl).toBe('/api/health');
  });

  it('in development, prefers runtime base over VITE env when both are set', async () => {
    (process as any).env.VITE_API_BASE_URL = 'https://prod.example.com';
    (window as any).__BASE_PATH__ = 'http://localhost:5173';
    (process as any).env.NODE_ENV = 'development';

    let apiRequest: any;
    jest.isolateModules(() => {
      ({ apiRequest } = require('@/services/api'));
    });

    await apiRequest('/health');
    const callUrl = String(((global.fetch as any).mock.calls[0] || [])[0]);
    expect(callUrl).toBe('http://localhost:5173/api-proxy/health');
  });

  it('in production, prefers VITE env over runtime base when both are set', async () => {
    (process as any).env.VITE_API_BASE_URL = 'https://api.prod.local';
    (window as any).__BASE_PATH__ = 'http://localhost:5173';
    (process as any).env.NODE_ENV = 'production';

    let apiRequest: any;
    jest.isolateModules(() => {
      ({ apiRequest } = require('@/services/api'));
    });

    await apiRequest('/health');
    const callUrl = String(((global.fetch as any).mock.calls[0] || [])[0]);
    expect(callUrl).toBe('https://api.prod.local/health');
  });
});