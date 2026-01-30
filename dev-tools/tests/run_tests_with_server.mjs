import '../mock-server/index.js';
import fetch from 'node-fetch';
import FormData from 'form-data';

const BASE = 'http://localhost:4001';
const TOKEN = 'officer-token';

function authHeaders(token = TOKEN) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
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
  const large = Buffer.alloc(6 * 1024 * 1024, 'a');
  form.append('files', large, { filename: 'large.pdf' });

  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form
  });
  const j = await res.json();
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
  console.log('Starting mock server and running tests...');
  // wait briefly for server to be ready
  await new Promise(r => setTimeout(r, 300));
  try {
    let patientId;
    // RBAC: attempt register with regular user token should fail
    await ok('Register patient forbidden for regular user', async () => {
      const body = { idCard: '9999999999999', firstName: 'No', lastName: 'Perm' };
      const res = await fetch(`${BASE}/api/community/patients/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer user-token` }, body: JSON.stringify(body) });
      if (res.status !== 403) throw new Error('Expected 403 for regular user');
    });

    // Use officer token to register
    await ok('Register patient (happy path) with officer', async () => { 
      const body = { idCard: '1234567890123', firstName: 'สมชาย', lastName: 'ใจดี' };
      const res = await fetch(`${BASE}/api/community/patients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer officer-token`, 'Idempotency-Key': 'key-123' },
        body: JSON.stringify(body)
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error('Register patient failed: ' + JSON.stringify(j));
      patientId = j.patient_id;
    });

    await ok('Register duplicate should 409', testRegisterDuplicate);

    await ok('Register idempotency: repeated key returns same', async () => {
      const body = { idCard: '2222222222222', firstName: 'A', lastName: 'B' };
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer officer-token`, 'Idempotency-Key': 'idem-123' };
      const r1 = await fetch(`${BASE}/api/community/patients/register`, { method: 'POST', headers, body: JSON.stringify(body) });
      const j1 = await r1.json();
      if (!r1.ok || !j1.success) throw new Error('first registration failed');
      const r2 = await fetch(`${BASE}/api/community/patients/register`, { method: 'POST', headers, body: JSON.stringify(body) });
      const j2 = await r2.json();
      if (!r2.ok || !j2.success) throw new Error('second idempotent call failed');
      if (j1.patient_id !== j2.patient_id) throw new Error('idempotent responses differ');
    });

    // Rate limit test: exceed allowed on register
    await ok('Rate limit on register (exceed)', async () => {
      const body = { idCard: '3000000000000', firstName: 'R', lastName: 'L' };
      let saw429 = false;
      for (let i=0;i<8;i++) {
        const res = await fetch(`${BASE}/api/community/patients/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer officer-token` }, body: JSON.stringify({...body, idCard: body.idCard + i}) });
        if (res.status === 429) saw429 = true;
      }
      if (!saw429) throw new Error('Expected at least one 429 when exceeding rate limit');
    });

    // Continue with original tests for profile and others
    await ok('Patch profile unauthorized should 401', testPatchProfileUnauthorized);
    await ok('Patch profile authorized', async () => {
      const res = await fetch(`${BASE}/api/community/users/user-1`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer user-token` }, body: JSON.stringify({ name: 'Updated User', phone: '0999999999' }) });
      const j = await res.json();
      if (!res.ok || !j.success || j.user.name !== 'Updated User') throw new Error('Profile patch failed');
    });
    await ok('Patch profile validation: invalid phone', async () => {
      const res = await fetch(`${BASE}/api/community/users/user-1`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer user-token` }, body: JSON.stringify({ phone: 'abc' }) });
      if (res.status !== 400) throw new Error('Expected 400 for invalid phone');
    });
    await ok('Change password with wrong current should fail', async () => {
      const res = await fetch(`${BASE}/api/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer user-token` }, body: JSON.stringify({ currentPassword: 'wrong', newPassword: 'newpass123' }) });
      const j = await res.json();
      if (res.ok) throw new Error('Expected failure when current password wrong');
    });
    await ok('Change password validation: missing newPassword', async () => {
      const res = await fetch(`${BASE}/api/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer user-token` }, body: JSON.stringify({ currentPassword: 'correct-password' }) });
      if (res.status !== 400) throw new Error('Expected 400 when newPassword missing');
    });
    await ok('Change password validation: weak newPassword', async () => {
      const res = await fetch(`${BASE}/api/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer user-token` }, body: JSON.stringify({ currentPassword: 'correct-password', newPassword: '123' }) });
      if (res.status !== 400) throw new Error('Expected 400 for weak new password');
    });
    await ok('Register validation: invalid idempotency key', async () => {
      const body = { idCard: '5555555555555', firstName: 'Bad', lastName: 'Key' };
      const res = await fetch(`${BASE}/api/community/patients/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer officer-token`, 'Idempotency-Key': '!!!' }, body: JSON.stringify(body) });
      if (![400, 429].includes(res.status)) throw new Error('Expected 400 or 429 for invalid idempotency key (got ' + res.status + ')');
    });
    await ok('Upload disallowed extension should be rejected', async () => {
      const form = new FormData();
      const buf = Buffer.from('test');
      form.append('files', buf, { filename: 'bad.exe' });
      const res = await fetch(`${BASE}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer officer-token` }, body: form });
      const j = await res.json();
      if (res.ok) throw new Error('Expected rejection for disallowed extension: ' + JSON.stringify(j));
    });
    await ok('Upload large file (6MB) should pass in mock', testUploadLargeFile);
    await ok('Upload EICAR should be detected and rejected', testUploadEicar);
    await ok('Ride request with past time should fail', async () => await testRideRequestPastTime(patientId));
  } catch (err) {
    console.error('Test runner error', err);
  } finally {
    console.log('Tests completed');
    process.exit(0);
  }
})();
