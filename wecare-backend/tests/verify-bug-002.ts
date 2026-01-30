/**
 * BUG-002 Verification Script
 * Verifies that caseConverter is working correctly
 */

import { snakeToCamel, camelToSnake, transformResponse } from '../src/utils/caseConverter';

console.log('🧪 BUG-002: Testing caseConverter utility\n');

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`✅ PASS: ${name}`);
        passed++;
    } catch (error: any) {
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${error.message}`);
        failed++;
    }
}

function assertEqual(actual: any, expected: any, message: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message}\n   Expected: ${JSON.stringify(expected)}\n   Actual: ${JSON.stringify(actual)}`);
    }
}

// Test 1: Simple snake_case to camelCase
test('Simple snake_case to camelCase conversion', () => {
    const input = { full_name: 'John Doe', contact_phone: '0812345678' };
    const output = snakeToCamel(input);
    assertEqual(output, { fullName: 'John Doe', contactPhone: '0812345678' }, 'Should convert keys');
});

// Test 2: Nested objects
test('Nested object conversion', () => {
    const input = {
        user_name: 'John',
        current_address: {
            house_number: '123',
            village_name: 'Test'
        }
    };
    const output = snakeToCamel(input);
    assertEqual(output, {
        userName: 'John',
        currentAddress: {
            houseNumber: '123',
            villageName: 'Test'
        }
    }, 'Should convert nested keys');
});

// Test 3: Arrays
test('Array conversion', () => {
    const input = [
        { user_name: 'John', patient_id: 'PAT-001' },
        { user_name: 'Jane', patient_id: 'PAT-002' }
    ];
    const output = snakeToCamel(input);
    assertEqual(output, [
        { userName: 'John', patientId: 'PAT-001' },
        { userName: 'Jane', patientId: 'PAT-002' }
    ], 'Should convert array items');
});

// Test 4: Null/undefined handling
test('Null and undefined handling', () => {
    assertEqual(snakeToCamel(null), null, 'Should handle null');
    assertEqual(snakeToCamel(undefined), undefined, 'Should handle undefined');

    const input = { user_name: 'John', profile_image: null };
    const output = snakeToCamel(input);
    assertEqual(output, { userName: 'John', profileImage: null }, 'Should preserve null values');
});

// Test 5: Real patient data
test('Real patient data transformation', () => {
    const dbPatient = {
        id: 'PAT-001',
        full_name: 'สมชาย ใจดี',
        national_id: '1234567890123',
        contact_phone: '0812345678',
        current_house_number: '123',
        patient_types: '["ผู้สูงอายุ"]',
        chronic_diseases: '["เบาหวาน"]',
        registered_date: '2024-01-01'
    };

    const apiResponse = transformResponse(dbPatient);

    assertEqual(apiResponse.fullName, 'สมชาย ใจดี', 'Should have fullName');
    assertEqual(apiResponse.nationalId, '1234567890123', 'Should have nationalId');
    assertEqual(apiResponse.contactPhone, '0812345678', 'Should have contactPhone');
    assertEqual(apiResponse.currentHouseNumber, '123', 'Should have currentHouseNumber');
    assertEqual(apiResponse.registeredDate, '2024-01-01', 'Should have registeredDate');

    if (apiResponse.full_name) {
        throw new Error('Should NOT have snake_case fields');
    }
});

// Test 6: Real ride data
test('Real ride data transformation', () => {
    const dbRide = {
        id: 'RIDE-001',
        patient_id: 'PAT-001',
        patient_name: 'สมชาย ใจดี',
        driver_id: 'DRV-001',
        pickup_location: 'บ้านเลขที่ 123',
        appointment_time: '2024-01-15T09:00:00Z',
        special_needs: '["wheelchair"]'
    };

    const apiResponse = transformResponse(dbRide);

    assertEqual(apiResponse.patientId, 'PAT-001', 'Should have patientId');
    assertEqual(apiResponse.patientName, 'สมชาย ใจดี', 'Should have patientName');
    assertEqual(apiResponse.driverId, 'DRV-001', 'Should have driverId');
    assertEqual(apiResponse.pickupLocation, 'บ้านเลขที่ 123', 'Should have pickupLocation');
    assertEqual(apiResponse.appointmentTime, '2024-01-15T09:00:00Z', 'Should have appointmentTime');

    if (apiResponse.patient_id) {
        throw new Error('Should NOT have snake_case fields');
    }
});

// Test 7: Reverse conversion (camelCase to snake_case)
test('camelCase to snake_case conversion', () => {
    const input = {
        fullName: 'John Doe',
        contactPhone: '0812345678',
        currentAddress: {
            houseNumber: '123'
        }
    };
    const output = camelToSnake(input);
    assertEqual(output, {
        full_name: 'John Doe',
        contact_phone: '0812345678',
        current_address: {
            house_number: '123'
        }
    }, 'Should convert to snake_case');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);
console.log('='.repeat(50));

if (failed === 0) {
    console.log('\n🎉 All tests PASSED!');
    console.log('✅ BUG-002 Implementation is CORRECT');
    process.exit(0);
} else {
    console.log('\n❌ Some tests FAILED!');
    console.log('🔄 Need to fix and iterate (back to Step 2)');
    process.exit(1);
}
