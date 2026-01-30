
const fetch = require('node-fetch'); // Needs node-fetch, or we can use built-in fetch if node version > 18 (User has v22 so native fetch is available)

const API_URL = 'http://localhost:3001/api';

async function fixLogin() {
    console.log('🔧 Attempting to fix Developer login via API...');

    // 1. Try Login with OLD password (the one currently in DB)
    const oldPass = 'g0KEk,^],k;yo';
    const email = 'jetci.jm@gmail.com';
    const newPass = 'devpass123';

    console.log(`1. Logging in with old password: ${oldPass.substring(0, 5)}...`);

    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: oldPass })
        });

        if (!loginRes.ok) {
            console.log('❌ Login failed with old password:', loginRes.status, loginRes.statusText);
            const err = await loginRes.json();
            console.log('   Error:', err);

            // Try logging in with NEW password just in case it already works
            console.log(`   Checking if already fixed (trying ${newPass})...`);
            const loginRes2 = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: newPass })
            });

            if (loginRes2.ok) {
                console.log('✅ It seems the password is ALREADY devpass123! Login worked.');
                return;
            }

            console.log('❌ Neither old nor new password worked. Database might be in inconsistent state.');
            return;
        }

        const loginData = await loginRes.json();
        const { user, token } = loginData;
        console.log('✅ Login success! Got User ID:', user.id);

        // 2. Change Password
        console.log(`2. Changing password to: ${newPass}`);
        const changeRes = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: user.id,
                currentPassword: oldPass,
                newPassword: newPass
            })
        });

        if (changeRes.ok) {
            console.log('✅ Password successfully changed via API!');
            console.log('🎉 You can now login with: devpass123');
        } else {
            console.log('❌ Failed to change password:', changeRes.status);
            const err = await changeRes.json();
            console.log('   Error:', err);
        }

    } catch (e) {
        console.error('❌ Network or Script Error. Is the backend running on port 3001?', e.message);
    }
}

fixLogin();
