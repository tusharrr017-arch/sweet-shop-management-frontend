import '../src/config/database';
import pool from '../src/config/database';
import bcrypt from 'bcryptjs';

async function checkUser() {
  try {
    const email = 'lakhanitushar552@gmail.com';
    
    console.log('Checking for user:', email);
    
    // Check all users
    const allUsers = await pool.query('SELECT id, email, role FROM users');
    console.log('\nAll users in database:');
    allUsers.rows.forEach((user: any) => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Try exact match
    const exactMatch = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log(`\nExact match query: ${exactMatch.rows.length} results`);
    
    // Try case-insensitive
    const caseInsensitive = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    console.log(`Case-insensitive query: ${caseInsensitive.rows.length} results`);
    
    if (caseInsensitive.rows.length > 0) {
      const user = caseInsensitive.rows[0];
      console.log(`\nFound user:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
      console.log(`  Role: ${user.role}`);
      
      // Test password
      const testPassword = 'test123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`\nPassword test for "${testPassword}": ${isValid ? 'VALID' : 'INVALID'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUser();

