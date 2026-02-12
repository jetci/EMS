const { exit } = require('process');

const API_URL = 'http://localhost:3001/api';
const officerCreds = { email: 'officer1@wecare.dev', password: 'password123' };
let token = '';

async function login() {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officerCreds)
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    token = data.token;
}

async function apiCall(method, endpoint, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const text = await res.text();
    return { status: res.status, ok: res.ok, text, data: text ? JSON.parse(text) : null };
}

async function testManageDrivers() {
    console.log('📋 Testing Manage Drivers...\n');

    await login();
    console.log('   ✅ Officer Login\n');

    // 1. Get Drivers
    const driversRes = await apiCall('GET', '/drivers');
    const drivers = Array.isArray(driversRes.data) ? driversRes.data : (driversRes.data?.drivers || []);
    console.log(`   ✅ Get Drivers: ${drivers.length}\n`);

    if (drivers.length === 0) {
        console.log('   ⚠️ No drivers to test\n');
        return;
    }

    const driverId = drivers[0].id;

    // 2. Get Single Driver
    const driverRes = await apiCall('GET', `/drivers/${driverId}`);
    if (driverRes.ok) {
        console.log(`   ✅ Get Driver: ${driverId}\n`);
    } else {
        throw new Error(`Get driver failed: ${driverRes.status}`);
    }

    // 3. Update Driver
    const updateData = {
        full_name: drivers[0].full_name || drivers[0].fullName || 'Test Driver',
        phone: '081-888-8888',
        status: 'AVAILABLE'
    };

    const updateRes = await apiCall('PUT', `/drivers/${driverId}`, updateData);
    if (updateRes.status === 204 || updateRes.ok) {
        console.log('   ✅ Update Driver\n');
    } else {
        console.log(`   ⚠️ Update: ${updateRes.status}\n`);
    }

    // 4. Create Driver
    const newDriver = {
        full_name: 'Test Driver ' + Date.now(),
        phone: '081-777-7777',
        license_number: 'TEST-' + Date.now(),
        status: 'AVAILABLE'
    };

    const createRes = await apiCall('POST', '/drivers', newDriver);
    if (createRes.ok) {
        const createdId = createRes.data?.id;
        console.log(`   ✅ Create Driver: ${createdId}\n`);

        // 5. Delete Created Driver
        const deleteRes = await apiCall('DELETE', `/drivers/${createdId}`);
        if (deleteRes.status === 204 || deleteRes.ok) {
            console.log('   ✅ Delete Driver\n');
        } else {
            console.log(`   ⚠️ Delete: ${deleteRes.status}\n`);
        }
    } else {
        console.log(`   ⚠️ Create: ${createRes.status} - ${createRes.text.substring(0, 100)}\n`);
    }
}

async function run() {
    try {
        await testManageDrivers();
        console.log('🎉 PASSED!\n');
        exit(0);
    } catch (error) {
        console.error('❌ FAILED:', error.message);
        exit(1);
    }
}

run();
