async function runTests() {
    console.log('📋 Running Operational Readiness Test (Health Check)...');

    try {
        const BASE_URL = 'http://localhost:3001/api';

        console.log('   🔄 Fetching /api/health...');
        const res = await fetch(`${BASE_URL}/health`);
        const data = await res.json();

        if (res.ok) {
            console.log('   ✅ Health Check Success');
            console.log('      Status:', data.status);
            console.log('      Database Healthy:', data.database.healthy);
            console.log('      Filesystem Writable:', data.filesystem.uploadsWritable);
            if (data.diskSpace) {
                console.log('      Disk Space (C:):', Math.round(data.diskSpace.Free / 1024 / 1024 / 1024), 'GB free of', Math.round(data.diskSpace.Size / 1024 / 1024 / 1024), 'GB');
            }
        } else {
            throw new Error('Health Check Failed: ' + JSON.stringify(data));
        }

        console.log('\n🎉 OPERATIONAL READINESS TESTS PASSED!');
    } catch (err) {
        console.error('❌ Operational Test Failed:', err.message);
        process.exit(1);
    }
}

runTests();
