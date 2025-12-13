import '../src/config/database';
import pool from '../src/config/database';

async function checkSweets() {
  try {
    console.log('Checking all sweets in database...\n');
    
    const result = await pool.query('SELECT id, name, category, price, quantity FROM sweets ORDER BY id');
    
    console.log(`Found ${result.rows.length} sweets:\n`);
    result.rows.forEach((sweet: any) => {
      console.log(`ID: ${sweet.id} | ${sweet.name} | ${sweet.category} | $${sweet.price} | Qty: ${sweet.quantity}`);
    });
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSweets();

