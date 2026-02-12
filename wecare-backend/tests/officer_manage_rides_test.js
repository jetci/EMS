const { exit } = require('process');

const API_URL = 'http://localhost:3001/api';
const officerCreds = { email: 'officer1@wecare.dev', password: 'password123' };
let token = '';

async function login() {
    console.log('1️⃣ Login...');
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officerCreds)
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    token = data.token;
    console.log('   ✅ Login OK\n');
}

async function apiCall(method, endpoint, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${endpoint}: ${res.status} - ${text}`);
    if (res.status === 204) return null;
    try { return JSON.parse(text); } catch { return text; }
}

async function testManageRides() {
    console.log('📋 Testing Manage Rides Page...\n');

    // 1. Get Rides
    const ridesData = await apiCall('GET', '/rides');
    const rides = ridesData?.data || ridesData || [];
    if (!Array.isArray(rides)) throw new Error('Rides not array');
    console.log(`   ✅ Get Rides: ${rides.length} items\n`);

    // 2. Get Drivers
    const driversData = await apiCall('GET', '/drivers');
    const drivers = Array.isArray(driversData) ? driversData : (driversData?.drivers || []);
    console.log(`   ✅ Get Drivers: ${drivers.length} items\n`);

    // 3. Assign Driver
    const pendingRide = rides.find(r => r.status === 'PENDING');
    if (pendingRide && drivers.length > 0) {
        await apiCall('PUT', `/rides/${pendingRide.id}`, {
            status: 'ASSIGNED',
            driver_id: drivers[0].id
        });
        console.log(`   ✅ Assign Driver OK\n`);
    } else {
        console.log(`   ⚠️ No PENDING ride\n`);
    }

    // 4. Cancel Ride
    const cancelable = rides.find(r => r.status === 'PENDING' || r.status === 'ASSIGNED');
    if (cancelable) {
        await apiCall('PUT', `/rides/${cancelable.id}`, { status: 'CANCELLED' });
        console.log(`   ✅ Cancel Ride OK\n`);
    } else {
        console.log(`   ⚠️ No ride to cancel\n`);
    }
}

async function run() {
    try {
        await login();
        await testManageRides();
        console.log('🎉 PASSED!\n');
        exit(0);
    } catch (error) {
        console.error('❌ FAILED:', error.message);
        exit(1);
    }
}

run();
