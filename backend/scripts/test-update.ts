import '../src/config/database';
import pool from '../src/config/database';

async function testUpdate() {
  try {
    console.log('Testing UPDATE query...');
    
    // First, get a sweet to update
    const sweets = await pool.query('SELECT * FROM sweets LIMIT 1');
    if (sweets.rows.length === 0) {
      console.log('No sweets found');
      return;
    }
    
    const sweet = sweets.rows[0];
    console.log('Found sweet:', sweet);
    
    // Test the UPDATE query
    const id = sweet.id;
    const newQuantity = sweet.quantity + 1;
    
    console.log(`\nUpdating sweet ID ${id} with quantity ${newQuantity}...`);
    
    const result = await pool.query(
      'UPDATE sweets SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newQuantity, id]
    );
    
    console.log('Update result:', JSON.stringify(result, null, 2));
    console.log('Rows:', result.rows);
    console.log('Row count:', result.rowCount);
    
    if (result.rows.length === 0) {
      console.log('\n❌ ERROR: No rows returned from UPDATE!');
    } else {
      console.log('\n✅ Update successful!');
    }
    
  } catch (error: any) {
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testUpdate();

