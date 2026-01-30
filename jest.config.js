/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/main.tsx',
        '!src/vite-env.d.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true
            }
        }]
    },
    testTimeout: 10000
};
