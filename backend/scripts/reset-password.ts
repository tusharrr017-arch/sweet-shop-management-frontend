import '../src/config/database';
import pool from '../src/config/database';
import bcrypt from 'bcryptjs';

async function resetPassword() {
  try {
    const email = 'lakhanitushar552@gmail.com';
    const newPassword = 'test123'; // Change this to your desired password
    
    console.log(`Resetting password for: ${email}`);
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    
    if (result.rows.length === 0) {
      console.log('User not found!');
      return;
    }
    
    const user = result.rows[0];
    console.log(`Found user: ${user.email}`);
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
    
    console.log(`Password reset successful!`);
    console.log(`New password: ${newPassword}`);
    console.log(`You can now login with this password.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

resetPassword();

