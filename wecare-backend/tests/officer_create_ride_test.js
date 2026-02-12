
const { exit } = require('process');

// Config
const API_URL = 'http://localhost:3001/api';
// Auth URL might be mounted under /api/auth or just /auth depending on index.ts
// verified from previous turns: it is /api/auth
const AUTH_URL = 'http://localhost:3001/api';

const officerCreds = {
    email: 'officer1@wecare.dev',
    password: 'password123'
};

const ridePayload = {
    patient_name: 'Test Patient Automation',
    pickup_location: 'Central Plaza',
    pickup_lat: 13.7563,
    pickup_lng: 100.5018,
    destination: 'Bangkok Hospital',
    destination_lat: 13.7469,
    destination_lng: 100.5351,
    trip_type: 'Emergency',
    special_needs: ['Wheelchair'],
    appointment_time: new Date().toISOString()
};

async function runTest() {
    console.log('🧪 Testing: Officer Create Ride (API)');

    try {
        // 1. Login
        console.log('1️⃣ Logging in as Officer...');
        const loginRes = await fetch(`${AUTH_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(officerCreds)
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   ✅ Login successful.');

        // 1.5 Create Patient first (to satisfy Foreign Key)
        console.log('1️⃣.5️⃣ Registering a Mock Patient...');
        const patientPayload = {
            fullName: 'Test Patient Automation',
            gender: 'Male',
            age: 30,
            address: '123 Test St',
            medicalCondition: 'None'
        };

        const createPatientRes = await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(patientPayload)
        });

        if (!createPatientRes.ok) {
            const err = await createPatientRes.text();
            throw new Error(`Create Patient failed: ${err}`);
        }
        const createdPatient = await createPatientRes.json();
        const patientId = createdPatient.id;
        console.log(`   ✅ Patient Created: ${patientId}`);

        // Update Ride Payload with valid Patient ID
        const validRidePayload = {
            ...ridePayload,
            patient_id: patientId
        };

        // 2. Create Ride
        console.log('2️⃣ Creating a new Ride...');
        const createRes = await fetch(`${API_URL}/rides`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validRidePayload)
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Create Ride failed: ${createRes.status} ${createRes.statusText} - ${err}`);
        }

        const createdRide = await createRes.json();
        console.log(`   ✅ Ride Created: ID=${createdRide.id}, Status=${createdRide.status}`);

        // 3. Verification
        if (createdRide.patientName !== ridePayload.patient_name || createdRide.pickupLocation !== ridePayload.pickup_location) {
            throw new Error('Created ride data mismatch.');
        }

        // 4. Verify in List
        console.log('3️⃣ Verifying Ride in List...');
        const listRes = await fetch(`${API_URL}/rides/${createdRide.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!listRes.ok) throw new Error('Cannot fetch created ride details.');
        const fetchedRide = await listRes.json();

        if (fetchedRide.id === createdRide.id) {
            console.log('   ✅ Ride verified in system.');
        } else {
            throw new Error('Fetched ID does not match created ID.');
        }

        console.log('\n🎉 TEST PASSED: Officer can create rides successfully.');
        exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        exit(1);
    }
}

runTest();
