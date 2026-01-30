/**
 * Deep Database Verification Script
 * Checks all tables, fields, indexes, and constraints
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db/wecare.db');

console.log('🔍 Deep Database Verification\n');
console.log('📁 Database:', DB_PATH);
console.log('=' .repeat(80));

try {
  const db = new Database(DB_PATH, { readonly: true });

  // Get all tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  console.log(`\n📊 Total Tables: ${tables.length}\n`);

  let totalFields = 0;
  const issues = [];

  tables.forEach((table, idx) => {
    console.log(`${idx + 1}. ${table.name.toUpperCase()}`);
    console.log('-'.repeat(80));

    // Get table info
    const fields = db.prepare(`PRAGMA table_info(${table.name})`).all();
    totalFields += fields.length;

    console.log(`   Fields: ${fields.length}`);
    
    // Show fields
    fields.forEach(field => {
      const constraints = [];
      if (field.pk) constraints.push('PK');
      if (field.notnull) constraints.push('NOT NULL');
      if (field.dflt_value) constraints.push(`DEFAULT ${field.dflt_value}`);
      
      const constraintStr = constraints.length > 0 ? ` [${constraints.join(', ')}]` : '';
      console.log(`   - ${field.name.padEnd(30)} ${field.type.padEnd(10)}${constraintStr}`);
    });

    // Get indexes
    const indexes = db.prepare(`PRAGMA index_list(${table.name})`).all();
    if (indexes.length > 0) {
      console.log(`\n   Indexes: ${indexes.length}`);
      indexes.forEach(idx => {
        const unique = idx.unique ? ' (UNIQUE)' : '';
        console.log(`   - ${idx.name}${unique}`);
      });
    }

    // Get foreign keys
    const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${table.name})`).all();
    if (foreignKeys.length > 0) {
      console.log(`\n   Foreign Keys: ${foreignKeys.length}`);
      foreignKeys.forEach(fk => {
        console.log(`   - ${fk.from} → ${fk.table}(${fk.to})`);
      });
    }

    // Check for potential issues
    if (table.name === 'patients') {
      const requiredFields = [
        'title', 'full_name', 'national_id', 'dob', 'age', 'gender',
        'blood_type', 'rh_factor', 'health_coverage', 'chronic_diseases', 'allergies',
        'contact_phone', 'current_house_number', 'current_village', 'current_tambon', 
        'current_amphoe', 'current_changwat',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
        'profile_image_url', 'created_by', 'created_at', 'updated_at'
      ];

      const fieldNames = fields.map(f => f.name);
      const missing = requiredFields.filter(rf => !fieldNames.includes(rf));
      
      if (missing.length > 0) {
        issues.push({
          table: table.name,
          type: 'Missing Fields',
          details: missing.join(', ')
        });
      }
    }

    console.log('');
  });

  // Summary
  console.log('=' .repeat(80));
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Tables: ${tables.length}`);
  console.log(`Total Fields: ${totalFields}`);
  console.log(`Average Fields per Table: ${(totalFields / tables.length).toFixed(1)}`);

  // Issues
  if (issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.table}] ${issue.type}: ${issue.details}`);
    });
  } else {
    console.log('\n✅ No issues found!');
  }

  // Check data integrity
  console.log('\n🔍 DATA INTEGRITY CHECKS');
  console.log('-'.repeat(80));

  // Check for orphaned records
  const orphanedPatients = db.prepare(`
    SELECT COUNT(*) as count FROM patients 
    WHERE created_by NOT IN (SELECT id FROM users)
  `).get();
  
  if (orphanedPatients.count > 0) {
    console.log(`⚠️  Orphaned patients (no creator): ${orphanedPatients.count}`);
  } else {
    console.log('✅ All patients have valid creators');
  }

  const orphanedRides = db.prepare(`
    SELECT COUNT(*) as count FROM rides 
    WHERE patient_id NOT IN (SELECT id FROM patients)
  `).get();
  
  if (orphanedRides.count > 0) {
    console.log(`⚠️  Orphaned rides (no patient): ${orphanedRides.count}`);
  } else {
    console.log('✅ All rides have valid patients');
  }

  // Check for duplicate national IDs
  const duplicateNationalIds = db.prepare(`
    SELECT national_id, COUNT(*) as count 
    FROM patients 
    WHERE national_id IS NOT NULL 
    GROUP BY national_id 
    HAVING count > 1
  `).all();
  
  if (duplicateNationalIds.length > 0) {
    console.log(`⚠️  Duplicate national IDs: ${duplicateNationalIds.length}`);
    duplicateNationalIds.forEach(dup => {
      console.log(`   - ${dup.national_id}: ${dup.count} records`);
    });
  } else {
    console.log('✅ No duplicate national IDs');
  }

  db.close();
  console.log('\n✅ Verification completed!\n');

} catch (error) {
  console.error('\n❌ Verification failed:', error.message);
  console.error(error);
  process.exit(1);
}
