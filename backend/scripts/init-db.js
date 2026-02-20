import { initializeDatabase, createSchema } from '../db/database.js';

async function init() {
  console.log('Initializing database...');
  try {
    const db = await initializeDatabase();
    await createSchema(db);
    console.log('✅ Database schema created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

init();
