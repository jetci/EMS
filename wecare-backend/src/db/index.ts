import postgresDB from './postgresDB';

// Export the database instance
// Currently defaulting to Postgres for the migration
export const db = postgresDB;

// Re-export specific types if needed
export type Database = typeof postgresDB;
