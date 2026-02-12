const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let token = '';

async function runTest() {
    console.log('📋 Testing Driver Role Functionality...');

    try {
        // 1. Login
        console.log('   🔄 Logging in as Driver...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'driver1@wecare.dev',
            password: 'password123'
        });
        token = loginRes.data.token;
        console.log('   ✅ Login Success');

        // 2. Get Driver Profile
        console.log('   🔄 Fetching Driver Profile...');
        const profileRes = await axios.get(`${BASE_URL}/drivers/my-profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Profile Data:', JSON.stringify(profileRes.data, null, 2));

        // 3. Update Profile (Check Sync)
        console.log('   🔄 Updating Profile (Name & Phone)...');
        const updateData = {
            full_name: 'Updated Driver Name',
            phone: '0987654321',
            license_plate: 'กก-1234',
            vehicle_model: 'Toyota Commuter',
            address: 'แม่สาย, เชียงราย'
        };

        // This hits /drivers/my-profile (PUT)
        await axios.put(`${BASE_URL}/drivers/my-profile`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Also hit /auth/profile to see if it syncs
        await axios.put(`${BASE_URL}/auth/profile`, {
            name: 'Updated Driver Name',
            phone: '0987654321'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('   ✅ Profile Update Sent');

        // 4. Verify in DB (using a separate script or just fetching again)
        console.log('   🔄 Verifying updates...');
        const verifyRes = await axios.get(`${BASE_URL}/drivers/my-profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (verifyRes.data.full_name === 'Updated Driver Name' && verifyRes.data.phone === '0987654321') {
            console.log('   ✅ Driver Profile updated successfully');
        } else {
            console.log('   ❌ Driver Profile update failed or mismatch');
            console.log('      Current:', verifyRes.data.full_name, verifyRes.data.phone);
        }

        console.log('\n🎉 TEST FINISHED!');
    } catch (err) {
        console.error('❌ Test Failed:', err.response?.data || err.message);
    }
}

runTest();
