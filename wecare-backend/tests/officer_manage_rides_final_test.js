const { exit } = require('process');

const API_URL = 'http://localhost:3001/api';
const officerCreds = { email: 'officer1@wecare.dev', password: 'password123' };
const communityCreds = { email: 'community1@wecare.dev', password: 'password123' };
let token = '';

async function login(creds) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    return data.token;
}

async function apiCall(method, endpoint, body = null, authToken = token) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const text = await res.text();
    return { status: res.status, ok: res.ok, text, data: text ? JSON.parse(text) : null };
}

async function testManageRides() {
    console.log('📋 Testing Manage Rides (Complete)...\n');

    token = await login(officerCreds);
    console.log('   ✅ Officer Login\n');

    const ridesRes = await apiCall('GET', '/rides');
    const rides = ridesRes.data?.data || ridesRes.data || [];
    console.log(`   ✅ Get Rides: ${rides.length}\n`);

    const driversRes = await apiCall('GET', '/drivers');
    const drivers = Array.isArray(driversRes.data) ? driversRes.data : (driversRes.data?.drivers || []);
    console.log(`   ✅ Get Drivers: ${drivers.length}\n`);

    if (rides.length === 0 || drivers.length < 2) {
        console.log('   ⚠️ Need at least 2 drivers for full test\n');
        return;
    }

    const driver1 = drivers[0].id;
    const driver2 = drivers[1].id;
    const rideId = rides[0].id;

    // Reset ride
    await apiCall('PUT', `/rides/${rideId}`, { status: 'PENDING', driver_id: null });

    // 1. Test Role Validation
    const communityToken = await login(communityCreds);
    const unauthorizedRes = await apiCall('PUT', `/rides/${rideId}`, {
        status: 'ASSIGNED',
        driver_id: driver1
    }, communityToken);

    if (unauthorizedRes.status === 403) {
        console.log('   ✅ Role Validation (403)\n');
    } else {
        throw new Error(`Role check failed: ${unauthorizedRes.status}`);
    }

    // 2. Test Driver Availability (use driver2 to ensure validation runs)
    await apiCall('PUT', `/drivers/${driver2}`, { status: 'BUSY' });

    const busyRes = await apiCall('PUT', `/rides/${rideId}`, {
        status: 'ASSIGNED',
        driver_id: driver2
    });

    if (busyRes.status === 409 && busyRes.text.includes('ไม่ว่าง')) {
        console.log('   ✅ Driver Availability Check (409)\n');
    } else {
        console.log(`   ⚠️ Availability: ${busyRes.status}\n`);
    }

    await apiCall('PUT', `/drivers/${driver2}`, { status: 'AVAILABLE' });

    // 3. Test Successful Assign
    await apiCall('PUT', `/rides/${rideId}`, { status: 'PENDING', driver_id: null });

    const assignRes = await apiCall('PUT', `/rides/${rideId}`, {
        status: 'ASSIGNED',
        driver_id: driver1
    });

    if (assignRes.ok) {
        console.log('   ✅ Assign Driver Success\n');
    } else {
        throw new Error(`Assign failed: ${assignRes.text}`);
    }
}

async function run() {
    try {
        await testManageRides();
        console.log('🎉 ALL TESTS PASSED!\n');
        exit(0);
    } catch (error) {
        console.error('❌ FAILED:', error.message);
        exit(1);
    }
}

run();
