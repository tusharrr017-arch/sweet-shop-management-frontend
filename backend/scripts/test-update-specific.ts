import '../src/config/database';
import pool from '../src/config/database';

async function testUpdateSpecific() {
  try {
    // Test updating Fudge (ID 8) which is Chocolate category
    const id = 8;
    const newName = 'Fudge Updated';
    
    console.log(`Testing UPDATE for sweet ID ${id}...`);
    
    // Check if exists first
    const check = await pool.query('SELECT * FROM sweets WHERE id = $1', [id]);
    console.log('Before update - Sweet exists:', check.rows.length > 0);
    if (check.rows.length > 0) {
      console.log('Current sweet:', check.rows[0]);
    }
    
    // Try the exact UPDATE query format used in the controller
    const updates = ['name = $1', 'updated_at = NOW()'];
    const values = [newName, id];
    const query = `UPDATE sweets SET ${updates.join(', ')} WHERE id = $2 RETURNING *`;
    
    console.log('\nQuery:', query);
    console.log('Values:', values);
    
    const result = await pool.query(query, values);
    
    console.log('\nResult:', JSON.stringify(result, null, 2));
    console.log('Rows returned:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('\n❌ ERROR: No rows returned!');
    } else {
      console.log('\n✅ Success! Updated sweet:', result.rows[0]);
    }
    
  } catch (error: any) {
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testUpdateSpecific();

