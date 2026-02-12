const { exit } = require('process');
const fs = require('fs');
const path = require('path');

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

async function testUpload() {
    console.log('📋 Testing Profile Image Upload...\n');
    await login();

    const imagePath = path.join(__dirname, 'test_image.jpg');
    if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, 'fake image data');
    }

    const formData = new FormData();
    const blob = new Blob(['fake image data'], { type: 'image/jpeg' });
    formData.append('profile_image', blob, 'test_image.jpg');

    console.log('   🔄 Uploading image...');
    const res = await fetch(`${API_URL}/auth/upload-profile-image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) { }

    if (res.ok) {
        console.log('   ✅ Upload Success:', data.message);
        console.log('   ✅ Image URL:', data.imageUrl);

        // Verify with /auth/me
        const verifyRes = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const verifyData = await verifyRes.json();
        if (verifyData.profileImageUrl === data.imageUrl) {
            console.log('   ✅ Profile image URL persisted in DB');
        } else {
            console.log(`   ❌ Persistence mismatch. Expected ${data.imageUrl}, got ${verifyData.profileImageUrl}`);
        }
    } else {
        console.log(`   ❌ Upload Failed: ${res.status} - ${text}`);
    }
}

testUpload().then(() => {
    console.log('\n🎉 TEST FINISHED!');
    exit(0);
}).catch(err => {
    console.error('\n❌ TEST ERROR:', err.message);
    exit(1);
});
