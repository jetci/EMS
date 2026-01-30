const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/wecare.db');
const db = new Database(dbPath);

try {
    // Get the latest patient
    const patient = db.prepare('SELECT id, full_name, patient_types FROM patients ORDER BY created_at DESC LIMIT 1').get();

    if (patient) {
        console.log('Patient ID:', patient.id);
        console.log('Name:', patient.full_name);
        console.log('Patient Types (Raw):', patient.patient_types);

        const types = JSON.parse(patient.patient_types);
        console.log('Patient Types (Parsed):', types);

        const expected = "ผู้ป่วยอื่นๆ (Cancer Stage 4)";
        const found = types.find(t => t.includes("Cancer Stage 4"));

        if (found) {
            console.log('✅ VERIFICATION PASSED: Found expected type:', found);
        } else {
            console.log('❌ VERIFICATION FAILED: Expected type not found.');
        }
    } else {
        console.log('No patients found.');
    }
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}
