// Script to initialize the PostgreSQL database table
// Run with: node scripts/init-db.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@vercel/postgres');

async function initDatabase() {
  const client = createClient();

  try {
    await client.connect();
    console.log('🔄 Creating photos table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        ai_comment TEXT NOT NULL,
        emoji VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Photos table created successfully!');

    // Verify the table was created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'photos'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verified: photos table exists');
    } else {
      console.log('❌ Warning: photos table not found');
    }

    console.log('\n🎉 Database initialization complete!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    await client.end();
    process.exit(1);
  }
}

initDatabase();
