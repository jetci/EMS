// Debug JWT Verification
// Run this in backend terminal: node debug-jwt-verification.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

console.log('=== JWT Debug ===');
console.log('JWT_SECRET:', JWT_SECRET ? JWT_SECRET.substring(0, 20) + '...' : 'NOT FOUND');

// Test token from frontend (paste the token you got from localStorage)
const testToken = 'PASTE_TOKEN_HERE';

if (testToken === 'PASTE_TOKEN_HERE') {
    console.log('\n❌ Please paste the actual token from localStorage.getItem("wecare_token")');
    process.exit(1);
}

try {
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('\n✅ Token is VALID');
    console.log('Decoded payload:', decoded);
} catch (error) {
    console.log('\n❌ Token is INVALID');
    console.log('Error:', error.message);
    
    // Try to decode without verification
    try {
        const parts = testToken.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            console.log('\nToken payload (unverified):', payload);
            console.log('Issued at:', new Date(payload.iat * 1000));
            console.log('Expires at:', new Date(payload.exp * 1000));
        }
    } catch (e) {
        console.log('Could not decode token:', e.message);
    }
}
