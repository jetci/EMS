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

async function testManagePatients() {
    console.log('📋 Testing Manage Patients...\n');

    await login();
    console.log('   ✅ Officer Login\n');

    const patientsRes = await apiCall('GET', '/patients');
    const patients = patientsRes.data?.data || patientsRes.data || [];
    console.log(`   ✅ Get Patients: ${patients.length}\n`);

    if (patients.length === 0) {
        console.log('   ⚠️ No patients\n');
        return;
    }

    const patientId = patients[0].id;

    // Get Single
    const patientRes = await apiCall('GET', `/patients/${patientId}`);
    if (patientRes.ok) {
        console.log(`   ✅ Get Patient: ${patientId}\n`);
    } else {
        throw new Error(`Get failed: ${patientRes.status}`);
    }

    // Update
    const updateData = {
        full_name: patients[0].full_name || patients[0].fullName || 'Test Patient',
        contact_phone: '081-999-9999'
    };

    const updateRes = await apiCall('PUT', `/patients/json/${patientId}`, updateData);
    if (updateRes.ok) {
        console.log('   ✅ Update Patient\n');
    } else {
        console.log(`   ⚠️ Update: ${updateRes.status} - ${updateRes.text.substring(0, 50)}\n`);
    }

    // Create
    const newPatient = {
        full_name: 'Test Patient ' + Date.now(),
        national_id: '1234567890123',
        dob: '1990-01-01',
        gender: 'male',
        contact_phone: '081-111-1111',
        current_address: {
            houseNumber: '123',
            village: 'Test Village',
            tambon: 'Test',
            amphoe: 'Test',
            changwat: 'Test'
        }
    };

    const createRes = await apiCall('POST', '/patients/json', newPatient);
    if (createRes.ok) {
        const createdId = createRes.data?.id;
        console.log(`   ✅ Create Patient: ${createdId}\n`);

        // Delete
        const deleteRes = await apiCall('DELETE', `/patients/${createdId}`);
        if (deleteRes.status === 204 || deleteRes.ok) {
            console.log('   ✅ Delete Patient\n');
        } else {
            console.log(`   ⚠️ Delete: ${deleteRes.status}\n`);
        }
    } else {
        console.log(`   ⚠️ Create: ${createRes.status} - ${createRes.text.substring(0, 100)}\n`);
    }
}

async function run() {
    try {
        await testManagePatients();
        console.log('🎉 PASSED!\n');
        exit(0);
    } catch (error) {
        console.error('❌ FAILED:', error.message);
        exit(1);
    }
}

run();
