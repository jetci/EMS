const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/wecare.db');
const db = new Database(dbPath);

try {
    // Get the latest patient
    const patient = db.prepare("SELECT * FROM patients ORDER BY created_at DESC LIMIT 1").get();

    if (patient) {
        console.log('Latest Patient ID:', patient.id);
        console.log('Title:', patient.title);
        console.log('Registered Address (ID Card):');
        console.log('- House No:', patient.id_card_house_number);
        console.log('- Village:', patient.id_card_village);
        console.log('- Tambon:', patient.id_card_tambon);
        console.log('- Amphoe:', patient.id_card_amphoe);
        console.log('- Changwat:', patient.id_card_changwat);
    } else {
        console.log('No patients found.');
    }
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}
