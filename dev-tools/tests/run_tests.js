import fetch from 'node-fetch';
import FormData from 'form-data';

const BASE = 'http://localhost:4001';
const TOKEN = 'test-token';

function authHeaders() {
  return { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
}

async function ok(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err && err.message ? err.message : err);
  }
}

async function testRegisterPatient() {
  const body = { idCard: '1234567890123', firstName: 'สมชาย', lastName: 'ใจดี' };
  const res = await fetch(`${BASE}/api/community/patients/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const j = await res.json();
  if (!res.ok || !j.success) throw new Error('Register patient failed: ' + JSON.stringify(j));
  // return patient id for further tests
  return j.patient_id;
}

async function testRegisterDuplicate() {
  const body = { idCard: '1234567890123', firstName: 'สมชาย', lastName: 'ใจดี' };
  const res = await fetch(`${BASE}/api/community/patients/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  if (res.status !== 409) throw new Error('Expected 409 on duplicate');
}

async function testPatchProfileUnauthorized() {
  const res = await fetch(`${BASE}/api/community/users/user-1`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacker' })
  });
  if (res.status !== 401) throw new Error('Expected 401 when no auth');
}

async function testPatchProfileAuthorized() {
  const res = await fetch(`${BASE}/api/community/users/user-1`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ name: 'Updated User', phone: '0999999999' })
  });
  const j = await res.json();
  if (!res.ok || !j.success || j.user.name !== 'Updated User') throw new Error('Profile patch failed');
}

async function testChangePasswordWrongCurrent() {
  const res = await fetch(`${BASE}/api/auth/change-password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword: 'wrong', newPassword: 'newpass123' })
  });
  const j = await res.json();
  if (res.ok) throw new Error('Expected failure when current password wrong');
}

async function testUploadLargeFile() {
  const form = new FormData();
  // create a 6MB buffer
  const large = Buffer.alloc(6 * 1024 * 1024, 'a');
  form.append('files', large, { filename: 'large.pdf' });

  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form
  });
  const j = await res.json();
  // server limit in mock is 10MB so this should pass; assert behavior
  if (!res.ok || !j.success) throw new Error('Large upload failed unexpectedly: ' + JSON.stringify(j));
}

async function testUploadEicar() {
  const form = new FormData();
  const eicar = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
  form.append('files', eicar, { filename: 'eicar.txt' });
  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form
  });
  const j = await res.json();
  if (res.ok) throw new Error('Expected upload to be rejected due to virus detection');
}

async function testRideRequestPastTime(patientId) {
  // set appointment to yesterday
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
  const date = yesterday.toISOString().split('T')[0];
  const time = `${String(yesterday.getHours()).padStart(2, '0')}:${String(yesterday.getMinutes()).padStart(2, '0')}`;
  const res = await fetch(`${BASE}/api/community/rides`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ patientId, appointmentDate: date, appointmentTime: time })
  });
  if (res.ok) throw new Error('Expected failure for past appointment');
}

(async () => {
  console.log('Running community module tests against mock server at', BASE);
  try {
    let patientId;
    await ok('Register patient (happy path)', async () => { patientId = await testRegisterPatient(); });
    await ok('Register duplicate should 409', testRegisterDuplicate);
    await ok('Patch profile unauthorized should 401', testPatchProfileUnauthorized);
    await ok('Patch profile authorized', testPatchProfileAuthorized);
    await ok('Change password with wrong current should fail', testChangePasswordWrongCurrent);
    await ok('Upload large file (6MB) should pass in mock', testUploadLargeFile);
    await ok('Upload EICAR should be detected and rejected', testUploadEicar);
    await ok('Ride request with past time should fail', async () => await testRideRequestPastTime(patientId));
  } catch (err) {
    console.error('Test runner error', err);
  }
})();
