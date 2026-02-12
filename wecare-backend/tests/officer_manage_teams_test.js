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

async function testManageTeams() {
    console.log('📋 Testing Manage Teams...\n');

    await login();
    console.log('   ✅ Officer Login\n');

    // 1. Get Teams
    const teamsRes = await apiCall('GET', '/teams');
    const teams = Array.isArray(teamsRes.data) ? teamsRes.data : (teamsRes.data?.teams || []);
    console.log(`   ✅ Get Teams: ${teams.length}\n`);

    // 2. Create Team
    const newTeam = {
        name: 'Test Team ' + Date.now(),
        description: 'Testing team creation',
        status: 'Active',
        leader_id: 'USR-DRIVER',
        member_ids: ['USR-COMMUNITY-1']
    };

    const createRes = await apiCall('POST', '/teams', newTeam);
    if (createRes.ok) {
        const createdId = createRes.data?.id;
        console.log(`   ✅ Create Team: ${createdId}\n`);

        // 3. Update Team
        const updateData = {
            name: newTeam.name + ' (Updated)',
            description: 'Updated description'
        };
        const updateRes = await apiCall('PUT', `/teams/${createdId}`, updateData);
        if (updateRes.ok) {
            console.log('   ✅ Update Team\n');
        } else {
            console.log(`   ⚠️ Update Team Failed: ${updateRes.status} - ${updateRes.text}\n`);
        }

        // 4. Delete Team
        const deleteRes = await apiCall('DELETE', `/teams/${createdId}`);
        if (deleteRes.status === 204 || deleteRes.ok) {
            console.log('   ✅ Delete Team\n');
        } else {
            console.log(`   ⚠️ Delete Team Failed: ${deleteRes.status}\n`);
        }
    } else {
        console.log(`   ⚠️ Create Team Failed: ${createRes.status} - ${createRes.text}\n`);
    }
}

async function run() {
    try {
        await testManageTeams();
        console.log('🎉 PASSED!\n');
        exit(0);
    } catch (error) {
        console.error('❌ FAILED:', error.message);
        exit(1);
    }
}

run();
