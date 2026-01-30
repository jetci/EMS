/**
 * Migration Script: Add Missing Patient Fields
 * Adds emergency contact and title fields to patients table
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../db/wecare.db');
const MIGRATION_SQL = path.join(__dirname, '../db/migrations/add_missing_patient_fields.sql');

console.log('🔧 Starting migration...');
console.log('📁 Database:', DB_PATH);
console.log('📄 Migration file:', MIGRATION_SQL);

try {
  // Check if database exists
  if (!fs.existsSync(DB_PATH)) {
    console.error('❌ Database file not found:', DB_PATH);
    process.exit(1);
  }

  // Check if migration file exists
  if (!fs.existsSync(MIGRATION_SQL)) {
    console.error('❌ Migration file not found:', MIGRATION_SQL);
    process.exit(1);
  }

  // Open database
  const db = new Database(DB_PATH);
  console.log('✅ Database opened');

  // Read migration SQL
  const sql = fs.readFileSync(MIGRATION_SQL, 'utf8');
  console.log('✅ Migration SQL loaded');

  // Get current schema before migration
  console.log('\n📊 Current patients table schema:');
  const beforeSchema = db.prepare("PRAGMA table_info(patients)").all();
  console.log(`   Fields: ${beforeSchema.length}`);
  
  // Check if fields already exist
  const existingFields = beforeSchema.map(col => col.name);
  const fieldsToAdd = ['title', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation'];
  const missingFields = fieldsToAdd.filter(field => !existingFields.includes(field));
  
  if (missingFields.length === 0) {
    console.log('✅ All fields already exist. Migration not needed.');
    db.close();
    process.exit(0);
  }

  console.log(`\n⚠️  Missing fields: ${missingFields.join(', ')}`);
  console.log('\n🔄 Running migration...');

  // Execute migration
  db.exec(sql);
  console.log('✅ Migration executed successfully');

  // Verify changes
  console.log('\n📊 Updated patients table schema:');
  const afterSchema = db.prepare("PRAGMA table_info(patients)").all();
  console.log(`   Fields: ${afterSchema.length}`);

  // Show new fields
  const newFields = afterSchema.filter(col => fieldsToAdd.includes(col.name));
  if (newFields.length > 0) {
    console.log('\n✅ New fields added:');
    newFields.forEach(field => {
      console.log(`   - ${field.name} (${field.type})`);
    });
  }

  // Close database
  db.close();
  console.log('\n✅ Migration completed successfully!');
  console.log('📝 Summary:');
  console.log(`   - Fields before: ${beforeSchema.length}`);
  console.log(`   - Fields after: ${afterSchema.length}`);
  console.log(`   - Fields added: ${afterSchema.length - beforeSchema.length}`);

} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.error(error);
  process.exit(1);
}
