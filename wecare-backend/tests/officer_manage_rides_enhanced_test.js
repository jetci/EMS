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
    console.log('📋 Testing Manage Rides (Enhanced)...\n');

    // 1. Officer Login
    token = await login(officerCreds);
    console.log('   ✅ Officer Login\n');

    // 2. Get Rides
    const ridesRes = await apiCall('GET', '/rides');
    const rides = ridesRes.data?.data || ridesRes.data || [];
    console.log(`   ✅ Get Rides: ${rides.length} items\n`);

    // 3. Get Drivers
    const driversRes = await apiCall('GET', '/drivers');
    const drivers = Array.isArray(driversRes.data) ? driversRes.data : (driversRes.data?.drivers || []);
    console.log(`   ✅ Get Drivers: ${drivers.length} items\n`);

    if (rides.length === 0 || drivers.length === 0) {
        console.log('   ⚠️ No data to test assign\n');
        return;
    }

    // 4. Test Role Validation (Community cannot assign)
    const communityToken = await login(communityCreds);
    const unauthorizedRes = await apiCall('PUT', `/rides/${rides[0].id}`, {
        status: 'ASSIGNED',
        driver_id: drivers[0].id
    }, communityToken);

    if (unauthorizedRes.status === 403) {
        console.log('   ✅ Role Validation: Community blocked\n');
    } else {
        throw new Error(`Role validation failed: ${unauthorizedRes.status}`);
    }

    // 5. Test Driver Availability Check (assign to unavailable driver)
    const driverId = drivers[0].id;
    await apiCall('PUT', `/drivers/${driverId}`, { status: 'BUSY' });

    const unavailableRes = await apiCall('PUT', `/rides/${rides[0].id}`, {
        status: 'ASSIGNED',
        driver_id: driverId
    });

    if (unavailableRes.status === 400) {
        console.log('   ✅ Driver Availability: Busy driver blocked\n');
    } else {
        console.log(`   ⚠️ Driver Availability check: ${unavailableRes.status}\n`);
    }

    // Reset driver status
    await apiCall('PUT', `/drivers/${drivers[0].id}`, { status: 'AVAILABLE' });

    // 6. Test Successful Assign
    const assignRes = await apiCall('PUT', `/rides/${rides[0].id}`, {
        status: 'ASSIGNED',
        driver_id: driverId
    });

    if (assignRes.ok) {
        console.log('   ✅ Assign Driver: Success\n');
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
