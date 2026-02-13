
const { Client } = require('pg');

async function resetPassword() {
    console.log('🔄 Attempting to connect with "trust" method...');

    // Try connecting with 'postgres' user and any password (ignored by trust)
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'any_password_works_with_trust',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully!');

        console.log('🔄 Resetting password to "admin123"...');
        await client.query("ALTER USER postgres WITH PASSWORD 'admin123';");
        console.log('✅ Password reset successful!');

        await client.end();
        console.log('🎉 You can now use "admin123" as the password.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

resetPassword();
