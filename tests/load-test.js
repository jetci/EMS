/**
 * K6 Load Testing Script
 * Tests API performance under load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 50 },    // Ramp down to 50 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be below 1%
    errors: ['rate<0.1'],             // Custom error rate below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
};

let authToken = '';

// Setup function (runs once per VU)
export function setup() {
  // Login to get token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200) {
    const body = JSON.parse(loginRes.body);
    return { token: body.token };
  }

  console.error('Setup failed: Could not login');
  return { token: '' };
}

// Main test function
export default function (data) {
  const token = data.token;

  // Test 1: Get patients list
  const patientsRes = http.get(`${BASE_URL}/api/patients`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  check(patientsRes, {
    'patients status is 200': (r) => r.status === 200,
    'patients response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Get single patient
  if (patientsRes.status === 200) {
    const patients = JSON.parse(patientsRes.body);
    if (patients.data && patients.data.length > 0) {
      const patientId = patients.data[0].id;

      const patientRes = http.get(`${BASE_URL}/api/patients/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      check(patientRes, {
        'patient status is 200': (r) => r.status === 200,
        'patient response time < 300ms': (r) => r.timings.duration < 300,
      }) || errorRate.add(1);
    }
  }

  sleep(1);

  // Test 3: Get rides list
  const ridesRes = http.get(`${BASE_URL}/api/rides`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  check(ridesRes, {
    'rides status is 200': (r) => r.status === 200,
    'rides response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Get drivers list
  const driversRes = http.get(`${BASE_URL}/api/drivers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  check(driversRes, {
    'drivers status is 200': (r) => r.status === 200,
    'drivers response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(2);
}

// Teardown function (runs once after all VUs finish)
export function teardown(data) {
  console.log('Load test completed');
}
