async function runTests() {
    console.log('📋 Running Security Enhancement Test (Upload Rate Limiting)...');

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

        // 2. Perform many profile updates rapidly
        console.log('   🔄 Hammering /api/auth/profile...');
        let hitLimit = false;

        // uploadLimiter is 100 per 5 mins in dev. 
        // Let's try to hit it. 
        for (let i = 0; i < 110; i++) {
            const res = await fetch(`${BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: 'Spam Name ' + i })
            });

            if (res.status === 429) {
                hitLimit = true;
                console.log(`   ✅ Rate limit hit at attempt ${i + 1}`);
                break;
            }
        }

        if (hitLimit) {
            console.log('   ✅ Rate limiting for updates/uploads is working');
        } else {
            console.log('   ❌ Rate limiting failed to trigger');
            throw new Error('Rate Limit Test Failed');
        }

        console.log('\n🎉 RATE LIMITING TESTS PASSED!');
    } catch (err) {
        console.error('❌ Rate Limit Test Failed:', err.message);
        process.exit(1);
    }
}

runTests();
