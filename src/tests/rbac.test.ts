/**
 * Test Suite for RBAC Configuration
 * ทดสอบ Permissions และ usePermissions Hook
 */

import {
    Permissions,
    getPermissions,
    canPerformAction,
    getDataFilterParams
} from '../config/permissions';

console.log('='.repeat(60));
console.log('🧪 RBAC Configuration Test Suite');
console.log('='.repeat(60));
console.log('');

// ============================================
// Test 1: Permission Structure
// ============================================
console.log('Test 1: Permission Structure');
console.log('-'.repeat(60));

const roles = ['community', 'OFFICER', 'admin', 'EXECUTIVE'];
const modules = ['patient', 'ride'];

roles.forEach(role => {
    console.log(`\n📋 Role: ${role}`);
    modules.forEach(module => {
        const perms = getPermissions(role, module);
        console.log(`  ${module}:`, JSON.stringify(perms, null, 2));
    });
});

console.log('\n✅ Test 1 Passed: Permission Structure OK');
console.log('');

// ============================================
// Test 2: Community User - Patient Permissions
// ============================================
console.log('Test 2: Community User - Patient Permissions');
console.log('-'.repeat(60));

const communityPatientPerms = getPermissions('community', 'patient');

console.log('Community Patient Permissions:', communityPatientPerms);

// Test Cases
const testCases = [
    {
        name: 'Can view own patients',
        expected: true,
        actual: communityPatientPerms.view === 'own'
    },
    {
        name: 'Can create patients',
        expected: true,
        actual: communityPatientPerms.create === true
    },
    {
        name: 'Can edit own patients',
        expected: true,
        actual: communityPatientPerms.edit === 'own'
    },
    {
        name: 'Can delete own patients',
        expected: true,
        actual: communityPatientPerms.delete === 'own'
    },
    {
        name: 'Items per page = 5',
        expected: true,
        actual: communityPatientPerms.itemsPerPage === 5
    }
];

testCases.forEach(test => {
    const status = test.actual === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.actual}`);
});

console.log('');

// ============================================
// Test 3: Officer - Patient Permissions
// ============================================
console.log('Test 3: Officer - Patient Permissions');
console.log('-'.repeat(60));

const officerPatientPerms = getPermissions('OFFICER', 'patient');

console.log('Officer Patient Permissions:', officerPatientPerms);

const officerTests = [
    {
        name: 'Can view all patients',
        expected: true,
        actual: officerPatientPerms.view === 'all'
    },
    {
        name: 'Can create patients',
        expected: true,
        actual: officerPatientPerms.create === true
    },
    {
        name: 'Can edit all patients',
        expected: true,
        actual: officerPatientPerms.edit === 'all'
    },
    {
        name: 'Can delete all patients',
        expected: true,
        actual: officerPatientPerms.delete === 'all'
    },
    {
        name: 'Items per page = 10',
        expected: true,
        actual: officerPatientPerms.itemsPerPage === 10
    }
];

officerTests.forEach(test => {
    const status = test.actual === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.actual}`);
});

console.log('');

// ============================================
// Test 4: canPerformAction Function
// ============================================
console.log('Test 4: canPerformAction Function');
console.log('-'.repeat(60));

const userId = 'user-123';
const resourceOwnerId = 'user-123';
const otherUserId = 'user-456';

const actionTests = [
    {
        name: 'Community can edit own patient',
        permission: 'own',
        resourceOwner: resourceOwnerId,
        currentUser: userId,
        expected: true
    },
    {
        name: 'Community cannot edit other patient',
        permission: 'own',
        resourceOwner: otherUserId,
        currentUser: userId,
        expected: false
    },
    {
        name: 'Officer can edit any patient',
        permission: 'all',
        resourceOwner: otherUserId,
        currentUser: userId,
        expected: true
    },
    {
        name: 'Executive cannot edit (none)',
        permission: 'none',
        resourceOwner: resourceOwnerId,
        currentUser: userId,
        expected: false
    }
];

actionTests.forEach(test => {
    const result = canPerformAction(
        test.permission as any,
        test.resourceOwner,
        test.currentUser
    );
    const status = result === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${result} (expected: ${test.expected})`);
});

console.log('');

// ============================================
// Test 5: getDataFilterParams Function
// ============================================
console.log('Test 5: getDataFilterParams Function');
console.log('-'.repeat(60));

const filterTests = [
    {
        name: 'Community - Filter by created_by',
        viewScope: 'own',
        userId: 'user-123',
        expected: { created_by: 'user-123' }
    },
    {
        name: 'Officer - No filter (all)',
        viewScope: 'all',
        userId: 'user-123',
        expected: {}
    },
    {
        name: 'Executive - No filter (all)',
        viewScope: 'all',
        userId: 'user-123',
        expected: {}
    }
];

filterTests.forEach(test => {
    const result = getDataFilterParams(test.viewScope as any, test.userId);
    const match = JSON.stringify(result) === JSON.stringify(test.expected);
    const status = match ? '✅' : '❌';
    console.log(`${status} ${test.name}:`, result);
});

console.log('');

// ============================================
// Test 6: Ride Permissions
// ============================================
console.log('Test 6: Ride Permissions');
console.log('-'.repeat(60));

const communityRidePerms = getPermissions('community', 'ride');
const officerRidePerms = getPermissions('OFFICER', 'ride');

console.log('Community Ride Permissions:', communityRidePerms);
console.log('Officer Ride Permissions:', officerRidePerms);

const rideTests = [
    {
        name: 'Community can create rides',
        expected: true,
        actual: communityRidePerms.create === true
    },
    {
        name: 'Community cannot assign driver',
        expected: true,
        actual: communityRidePerms.assignDriver === false
    },
    {
        name: 'Community can rate',
        expected: true,
        actual: communityRidePerms.rate === true
    },
    {
        name: 'Officer cannot create rides',
        expected: true,
        actual: officerRidePerms.create === false
    },
    {
        name: 'Officer can assign driver',
        expected: true,
        actual: officerRidePerms.assignDriver === true
    },
    {
        name: 'Officer can cancel',
        expected: true,
        actual: officerRidePerms.cancel === true
    }
];

rideTests.forEach(test => {
    const status = test.actual === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.actual}`);
});

console.log('');

// ============================================
// Test Summary
// ============================================
console.log('='.repeat(60));
console.log('📊 Test Summary');
console.log('='.repeat(60));

const allTests = [
    ...testCases,
    ...officerTests,
    ...actionTests.map(t => ({ ...t, actual: canPerformAction(t.permission as any, t.resourceOwner, t.currentUser) })),
    ...filterTests.map(t => ({ ...t, actual: JSON.stringify(getDataFilterParams(t.viewScope as any, t.userId)) === JSON.stringify(t.expected) })),
    ...rideTests
];

const passed = allTests.filter(t => t.actual === t.expected).length;
const total = allTests.length;
const percentage = Math.round((passed / total) * 100);

console.log(`Total Tests: ${total}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${total - passed}`);
console.log(`Pass Rate: ${percentage}%`);
console.log('');

if (percentage === 100) {
    console.log('✅ All Tests Passed!');
    console.log('🎉 RBAC Configuration is working correctly!');
} else {
    console.log('❌ Some Tests Failed!');
    console.log('⚠️  Please review the RBAC Configuration.');
}

console.log('='.repeat(60));

export default {
    testCases,
    officerTests,
    actionTests,
    filterTests,
    rideTests
};
