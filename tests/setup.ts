/**
 * Jest Setup File
 * Configures testing environment and global test utilities
 */

import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

global.localStorage = localStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Suppress console errors in tests (optional)
const originalError = console.error;
const suppressedPatterns: RegExp[] = [
    /Warning: ReactDOM\.render/,
    /Failed to load profile:/,
    /Failed to upload image:/,
    /Failed to update profile:/,
    /Failed to load dashboard data:/,
    /Failed to load dashboard:/,
    /Failed to load density heatmap:/,
    /Failed to load demographics report:/,
    /Failed to load village distribution:/,
    /Failed to fetch logs:/,
    /Failed to load operational report:/,
    /Failed to load spatial analytics:/,
    /Failed to assign driver:/,
    /Failed to cancel ride:/,
    /Report generation failed:/,
    /Export error:/,
    /Image load failed/,
];
beforeAll(() => {
    console.error = (...args: any[]) => {
        const msg = typeof args[0] === 'string' ? args[0] : '';
        if (suppressedPatterns.some((re) => re.test(msg))) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
