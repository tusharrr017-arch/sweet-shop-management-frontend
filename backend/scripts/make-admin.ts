import '../src/config/database';
import pool from '../src/config/database';

async function makeAdmin() {
  // Change this to your email
  const email = 'lakhanitushar552@gmail.com';
  
  try {
    console.log(`Making ${email} an admin...`);
    
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE LOWER(email) = LOWER($2) RETURNING *',
      ['admin', email]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`✅ Success! User is now an admin:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`\n⚠️  Please logout and login again to refresh your token.`);
    } else {
      console.log(`❌ User with email "${email}" not found.`);
      console.log(`\nAvailable users:`);
      const allUsers = await pool.query('SELECT id, email, role FROM users');
      allUsers.rows.forEach((u: any) => {
        console.log(`   - ${u.email} (${u.role})`);
      });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

makeAdmin();

