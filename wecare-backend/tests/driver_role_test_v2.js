const BASE_URL = 'http://localhost:3001/api';
let token = '';

async function runTest() {
    console.log('📋 Testing Driver Role Functionality (Fetch API)...');

    try {
        // 1. Login
        console.log('   🔄 Logging in as Driver...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'driver1@wecare.dev',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        token = loginData.token;
        if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData));
        console.log('   ✅ Login Success');

        // 2. Get Driver Profile
        console.log('   🔄 Fetching Driver Profile...');
        const profileRes = await fetch(`${BASE_URL}/drivers/my-profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        console.log('   ✅ Profile Data:', JSON.stringify(profileData, null, 2));

        // 3. Update Profile (Check Sync)
        console.log('   🔄 Updating Profile (Name & Phone)...');
        const updateData = {
            full_name: 'Updated Driver Name',
            phone: '0987654321',
            license_plate: 'กก-1234',
            vehicle_model: 'Toyota Commuter',
            address: 'แม่สาย, เชียงราย'
        };

        await fetch(`${BASE_URL}/drivers/my-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        // Also hit /auth/profile to see if it syncs
        await fetch(`${BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Updated Driver Name',
                phone: '0987654321'
            })
        });

        console.log('   ✅ Profile Update Sent');

        // 4. Verify in DB
        console.log('   🔄 Verifying updates...');
        const verifyRes = await fetch(`${BASE_URL}/drivers/my-profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const verifyData = await verifyRes.json();

        if (verifyData.full_name === 'Updated Driver Name' && verifyData.phone === '0987654321') {
            console.log('   ✅ Driver Profile updated successfully');
        } else {
            console.log('   ❌ Driver Profile update failed or mismatch');
            console.log('      Current:', verifyData.full_name, verifyData.phone);
        }

        console.log('\n🎉 TEST FINISHED!');
    } catch (err) {
        console.error('❌ Test Failed:', err.message);
    }
}

runTest();
