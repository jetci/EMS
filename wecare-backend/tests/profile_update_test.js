const { exit } = require('process');

const API_URL = 'http://localhost:3001/api';
const officerCreds = { email: 'officer1@wecare.dev', password: 'password123' };
let token = '';
let userId = '';

async function login() {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officerCreds)
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    token = data.token;
    userId = data.user.id;
    console.log(`   ✅ Logged in as: ${data.user.email} (ID: ${userId})`);
}

async function apiCall(method, endpoint, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { }
    return { status: res.status, ok: res.ok, text, data };
}

async function testProfileUpdate() {
    console.log('📋 Testing Profile Update...\n');

    await login();

    // 1. Get current profile
    const getRes = await apiCall('GET', '/auth/me');
    console.log('   ✅ Get Profile:', getRes.ok ? 'Success' : 'Failed');
    if (!getRes.ok) console.log('      Error:', getRes.text);

    const currentName = getRes.data?.name || '';
    const newName = currentName.includes('Updated') ? currentName.replace(' Updated', '') : currentName + ' Updated';

    // 2. Update profile
    console.log(`   🔄 Updating profile name to: "${newName}"...`);
    const updateRes = await apiCall('PUT', '/auth/profile', { name: newName });

    if (updateRes.ok) {
        console.log('   ✅ Update Profile: Success');
        if (updateRes.data?.name === newName) {
            console.log('   ✅ Name verified in response');
        } else {
            console.log(`   ⚠️ Name mismatch in response: Expected "${newName}", Got "${updateRes.data?.name}"`);
        }
    } else {
        console.log(`   ⚠️ Update Profile Failed: ${updateRes.status} - ${updateRes.text}`);
    }

    // 3. Verify with /auth/me again
    const verifyRes = await apiCall('GET', '/auth/me');
    if (verifyRes.data?.name === newName) {
        console.log('   ✅ Profile update persisted in DB');
    } else {
        console.log(`   ❌ Profile update failed to persist. Got: "${verifyRes.data?.name}"`);
    }
}

async function run() {
    try {
        await testProfileUpdate();
        console.log('\n🎉 TEST FINISHED!\n');
        exit(0);
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        exit(1);
    }
}

run();
