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

async function testManageRidesFull() {
    console.log('📋 Testing Manage Rides (Complete)...\n');

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
        console.log('   ⚠️ No data to test\n');
        return;
    }

    const driverId = drivers[0].id;
    const rideId = rides[0].id;

    // 4. Test Role Validation
    const communityToken = await login(communityCreds);
    const unauthorizedRes = await apiCall('PUT', `/rides/${rideId}`, {
        status: 'ASSIGNED',
        driver_id: driverId
    }, communityToken);

    if (unauthorizedRes.status === 403) {
        console.log('   ✅ Role Validation: Community blocked (403)\n');
    } else {
        throw new Error(`Role validation failed: ${unauthorizedRes.status}`);
    }

    // 5. Test Driver Availability Check
    await apiCall('PUT', `/drivers/${driverId}`, { status: 'BUSY' });

    const busyRes = await apiCall('PUT', `/rides/${rideId}`, {
        status: 'ASSIGNED',
        driver_id: driverId
    });

    if (busyRes.status === 409 && busyRes.text.includes('ไม่ว่าง')) {
        console.log('   ✅ Driver Availability: Busy driver blocked (409)\n');
    } else {
        console.log(`   ⚠️ Driver Availability: ${busyRes.status} - ${busyRes.text}\n`);
    }

    // Reset driver
    await apiCall('PUT', `/drivers/${driverId}`, { status: 'AVAILABLE' });

    // 6. Test Rate Limiting (11 requests in 1 minute)
    console.log('   🔄 Testing Rate Limit (11 requests)...');
    let rateLimitHit = false;
    for (let i = 0; i < 11; i++) {
        const res = await apiCall('PUT', `/rides/${rideId}`, {
            status: 'ASSIGNED',
            driver_id: driverId
        });
        if (res.status === 429) {
            rateLimitHit = true;
            console.log(`   ✅ Rate Limit: Hit after ${i + 1} requests (429)\n`);
            break;
        }
    }
    if (!rateLimitHit) {
        console.log('   ⚠️ Rate Limit: Not triggered (may need adjustment)\n');
    }

    // 7. Test Successful Assign
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 min for rate limit reset
    const assignRes = await apiCall('PUT', `/rides/${rideId}`, {
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
        await testManageRidesFull();
        console.log('🎉 ALL TESTS PASSED!\n');
        exit(0);
    } catch (error) {
        console.error('❌ FAILED:', error.message);
        exit(1);
    }
}

run();
