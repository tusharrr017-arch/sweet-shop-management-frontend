import '../src/config/database';
import pool from '../src/config/database';

async function testConnection() {
  try {
    console.log('Testing database connection...\n');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    // Check if tables exist
    console.log('\nChecking for tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found. You need to run migrations first!');
      console.log('   Run: psql $DATABASE_URL -f migrations/001_initial_schema.sql');
    } else {
      console.log('✅ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    // Check if users table has data
    try {
      const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n📊 Users in database: ${userCount.rows[0].count}`);
    } catch (err: any) {
      if (err.message.includes('does not exist')) {
        console.log('\n⚠️  Users table does not exist. Run migrations first!');
      }
    }
    
    console.log('\n✅ Connection test completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check that DATABASE_URL is set in your .env file');
    console.error('2. Verify the connection string is correct');
    console.error('3. Make sure your database is accessible');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();

