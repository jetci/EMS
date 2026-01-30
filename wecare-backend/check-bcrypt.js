const bcrypt = require('bcryptjs');

async function testBcrypt() {
    try {
        console.log('Testing bcrypt...');
        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);
        console.log('Hash created:', hash);
        const match = await bcrypt.compare(password, hash);
        console.log('Match result:', match);
        console.log('Bcrypt test passed!');
    } catch (error) {
        console.error('Bcrypt failed:', error);
        process.exit(1);
    }
}

testBcrypt();
