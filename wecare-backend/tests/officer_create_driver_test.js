
// Native fetch is used (Node 18+)
const { exit } = require('process');

// Config
const API_URL = 'http://localhost:3001/api';
const AUTH_URL = 'http://localhost:3001/api';

// Test Data
const officerCreds = {
    email: 'officer1@wecare.dev',
    password: 'password123'
};

const newDriverData = {
    full_name: 'Test Driver Created By Officer',
    phone: '099-999-9999',
    license_number: 'TEST-DL-001',
    status: 'AVAILABLE'
};

async function runTest() {
    console.log('🧪 Testing: Officer Create Driver Permission');

    try {
        // 1. Login as Officer
        console.log('1️⃣ Logging in as Officer...');
        const loginRes = await fetch(`${AUTH_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(officerCreds)
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   ✅ Login successful. Token received.');

        // 2. Try to Create Driver
        console.log('2️⃣ Attempting to create a new driver...');
        const createRes = await fetch(`${API_URL}/drivers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newDriverData)
        });

        if (createRes.status === 403) {
            console.error('   ❌ FAILED: 403 Forbidden. Officer does not have permission.');
            exit(1);
        }

        if (!createRes.ok) {
            const errorText = await createRes.text();
            throw new Error(`Create failed: ${createRes.status} - ${errorText}`);
        }

        const createdDriver = await createRes.json();
        console.log('   ✅ Driver created successfully!');
        console.log(`      ID: ${createdDriver.id}`);
        console.log(`      Name: ${createdDriver.full_name}`);

        // 3. Clean up (Optional - Delete the test driver)
        console.log('3️⃣ Cleanup: Deleting test driver...');
        const deleteRes = await fetch(`${API_URL}/drivers/${createdDriver.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (deleteRes.ok) {
            console.log('   ✅ Cleanup successful.');
        } else {
            // If Officer can't delete, that might be correct, so we just warn
            console.warn(`   ⚠️ Cleanup failed (maybe expected if Officer cannot delete): ${deleteRes.status}`);
        }

        console.log('\n🎉 TEST PASSED: Officer can create drivers.');
        exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        exit(1);
    }
}

// Run the test
runTest();
