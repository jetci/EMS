/**
 * CORS Configuration Test Script
 * Tests CORS headers and origin validation
 * 
 * Usage:
 *   node test-cors.js
 * 
 * Requirements:
 *   - Backend server must be running on http://localhost:3001
 */

const http = require('http');

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// Test configuration
const BACKEND_URL = 'http://localhost:3001';
const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 3001;

// Test cases
const testCases = [
    {
        name: 'Allowed Origin - localhost:5173',
        origin: 'http://localhost:5173',
        expectAllow: true,
    },
    {
        name: 'Allowed Origin - localhost:3000',
        origin: 'http://localhost:3000',
        expectAllow: true,
    },
    {
        name: 'Allowed Origin - 127.0.0.1:5173',
        origin: 'http://127.0.0.1:5173',
        expectAllow: true,
    },
    {
        name: 'Blocked Origin - evil.com',
        origin: 'https://evil.com',
        expectAllow: false,
    },
    {
        name: 'Blocked Origin - random-domain.com',
        origin: 'http://random-domain.com',
        expectAllow: false,
    },
    {
        name: 'No Origin Header',
        origin: null,
        expectAllow: false,
    },
];

// Test results
let passed = 0;
let failed = 0;
const results = [];

/**
 * Make HTTP request with specific origin
 */
function makeRequest(origin) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BACKEND_HOST,
            port: BACKEND_PORT,
            path: '/api/csrf-token',
            method: 'GET',
            headers: origin ? { 'Origin': origin } : {},
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

/**
 * Test preflight request (OPTIONS)
 */
function testPreflight(origin) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BACKEND_HOST,
            port: BACKEND_PORT,
            path: '/api/patients',
            method: 'OPTIONS',
            headers: {
                'Origin': origin,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization',
            },
        };

        const req = http.request(options, (res) => {
            resolve({
                statusCode: res.statusCode,
                headers: res.headers,
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

/**
 * Run a single test case
 */
async function runTest(testCase) {
    console.log(`\n${colors.cyan}Testing: ${testCase.name}${colors.reset}`);
    console.log(`  Origin: ${testCase.origin || '(none)'}`);

    try {
        const response = await makeRequest(testCase.origin);
        const corsHeader = response.headers['access-control-allow-origin'];
        const credentialsHeader = response.headers['access-control-allow-credentials'];

        const isAllowed = corsHeader === testCase.origin;
        const hasCredentials = credentialsHeader === 'true';

        // Check if result matches expectation
        const testPassed = isAllowed === testCase.expectAllow;

        if (testPassed) {
            console.log(`  ${colors.green}✓ PASS${colors.reset}`);
            passed++;
        } else {
            console.log(`  ${colors.red}✗ FAIL${colors.reset}`);
            failed++;
        }

        console.log(`  Status: ${response.statusCode}`);
        console.log(`  CORS Header: ${corsHeader || '(not set)'}`);
        console.log(`  Credentials: ${credentialsHeader || '(not set)'}`);

        // Test preflight if origin is allowed
        if (testCase.expectAllow && testCase.origin) {
            console.log(`  ${colors.yellow}Testing preflight...${colors.reset}`);
            const preflightResponse = await testPreflight(testCase.origin);
            const preflightCors = preflightResponse.headers['access-control-allow-origin'];
            const allowMethods = preflightResponse.headers['access-control-allow-methods'];
            const allowHeaders = preflightResponse.headers['access-control-allow-headers'];

            if (preflightResponse.statusCode === 200 && preflightCors === testCase.origin) {
                console.log(`  ${colors.green}✓ Preflight PASS${colors.reset}`);
                console.log(`  Allowed Methods: ${allowMethods || '(not set)'}`);
                console.log(`  Allowed Headers: ${allowHeaders || '(not set)'}`);
            } else {
                console.log(`  ${colors.red}✗ Preflight FAIL${colors.reset}`);
            }
        }

        results.push({
            name: testCase.name,
            passed: testPassed,
            origin: testCase.origin,
            corsHeader,
            credentialsHeader,
        });

    } catch (error) {
        console.log(`  ${colors.red}✗ ERROR: ${error.message}${colors.reset}`);
        failed++;
        results.push({
            name: testCase.name,
            passed: false,
            error: error.message,
        });
    }
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.log(`${colors.blue}╔═══════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║          CORS Configuration Test Suite                   ║${colors.reset}`);
    console.log(`${colors.blue}╚═══════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`\nBackend URL: ${BACKEND_URL}`);
    console.log(`Total Tests: ${testCases.length}\n`);

    // Check if backend is running
    console.log(`${colors.yellow}Checking if backend is running...${colors.reset}`);
    try {
        await makeRequest(null);
        console.log(`${colors.green}✓ Backend is running${colors.reset}\n`);
    } catch (error) {
        console.log(`${colors.red}✗ Backend is not running!${colors.reset}`);
        console.log(`${colors.red}Please start the backend server first:${colors.reset}`);
        console.log(`  cd wecare-backend`);
        console.log(`  npm run dev\n`);
        process.exit(1);
    }

    // Run all tests
    for (const testCase of testCases) {
        await runTest(testCase);
    }

    // Print summary
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}Test Summary${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`Total Tests: ${testCases.length}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

    if (failed === 0) {
        console.log(`${colors.green}✓ All tests passed! CORS configuration is working correctly.${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`${colors.red}✗ Some tests failed. Please check the CORS configuration.${colors.reset}\n`);
        process.exit(1);
    }
}

// Run tests
runAllTests().catch((error) => {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
});
