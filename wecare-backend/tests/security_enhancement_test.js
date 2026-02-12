const fs = require('fs');
const path = require('path');

async function runTests() {
    console.log('📋 Running Security Enhancement Test (Magic Bytes)...');

    try {
        const BASE_URL = 'http://localhost:3001/api';

        // 1. Login
        console.log('   🔄 Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'driver1@wecare.dev', password: 'password123' })
        });
        const { token } = await loginRes.json();
        console.log('   ✅ Login Success');

        // 2. Create a fake "fake_image.jpg" containing text
        const fakePath = path.join(__dirname, 'fake_image.jpg');
        fs.writeFileSync(fakePath, 'This is a text file pretending to be an image');
        console.log('   ✅ Fake image created');

        // 3. Try to upload it
        console.log('   🔄 Uploading fake image...');
        const formData = new FormData();
        const fileContent = fs.readFileSync(fakePath);
        const blob = new Blob([fileContent], { type: 'image/jpeg' });
        formData.append('profile_image', blob, 'fake_image.jpg');

        const uploadRes = await fetch(`${BASE_URL}/auth/upload-profile-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const result = await uploadRes.json();

        if (uploadRes.status === 400 && result.error.includes('not a valid image')) {
            console.log('   ✅ Correctly rejected fake image content');
        } else {
            console.log('   ❌ Validation failed to reject fake image:', uploadRes.status, result);
            throw new Error('Security Validation Failed');
        }

        // Clean up
        if (fs.existsSync(fakePath)) fs.unlinkSync(fakePath);

        console.log('\n🎉 SECURITY ENHANCEMENT TESTS PASSED!');
    } catch (err) {
        console.error('❌ Security Test Failed:', err.message);
        process.exit(1);
    }
}

runTests();
