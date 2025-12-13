import '../src/config/database';
import pool from '../src/config/database';

async function testPurchase() {
  try {
    console.log('Testing purchase query...');
    
    // Test the UPDATE query with RETURNING
    const id = 1;
    const newQuantity = 99;
    
    const result = await pool.query(
      'UPDATE sweets SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newQuantity, id]
    );
    
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('Rows:', result.rows);
    console.log('Row count:', result.rowCount);
    
  } catch (error: any) {
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testPurchase();

