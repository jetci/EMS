
const { Client } = require('pg');

const commonUsers = ['postgres', 'admin', 'root', 'user'];
const commonPasswords = [
    '',              // No password
    'postgres',      // User name as password
    'admin',         // Common default
    'password',      // Common default
    '1234',          // Common default
    '123456',        // Common default
    'admin123',      // Common default
    'root',          // Common default
    'wecare',        // Project name
    'sa',            // System Administrator
    'masterkey'      // Another common default
];

async function tryConnect(user, password) {
    const client = new Client({
        user: user,
        host: 'localhost',
        database: 'postgres', // Connect to default 'postgres' db first
        password: password,
        port: 5432,
    });

    try {
        await client.connect();
        await client.end();
        return { user, password };
    } catch (err) {
        return null;
    }
}

async function discover() {
    console.log('🔍 Attempting to discover PostgreSQL credentials...');

    for (const user of commonUsers) {
        for (const pass of commonPasswords) {
            process.stdout.write(`Testing User: '${user}', Pass: '${pass}' ... `);
            const result = await tryConnect(user, pass);
            if (result) {
                console.log('\n✨ Valid credentials found!');
                console.log(`User: ${result.user}`);
                console.log(`Password: ${result.password}`);
                console.log(`URL: postgresql://${result.user}:${result.password}@localhost:5432/wecare`);
                process.exit(0);
            } else {
                console.log('Failed');
            }
        }
    }

    console.log('\n❌ No common credentials worked.');
    process.exit(1);
}

discover();
