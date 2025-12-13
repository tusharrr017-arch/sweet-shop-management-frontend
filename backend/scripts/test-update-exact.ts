import '../src/config/database';
import pool from '../src/config/database';

async function testUpdateExact() {
  try {
    // Test with the exact same query format as the controller
    const id = 3; // Lollipop
    const name = 'Lollipop Updated';
    const category = 'Hard Candy';
    const price = 1.75;
    const quantity = 199;
    
    console.log(`Testing UPDATE for sweet ID ${id}...\n`);
    
    // Build query exactly like the controller does
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;
    
    updates.push(`name = $${++paramCount}`);
    values.push(name);
    updates.push(`category = $${++paramCount}`);
    values.push(category);
    updates.push(`price = $${++paramCount}`);
    values.push(price);
    updates.push(`quantity = $${++paramCount}`);
    values.push(quantity);
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `UPDATE sweets SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    console.log('Query:', query);
    console.log('Values:', values);
    console.log('Param count:', paramCount);
    
    const result = await pool.query(query, values);
    
    console.log('\nResult:', JSON.stringify(result, null, 2));
    console.log('Rows returned:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('\n❌ ERROR: No rows returned!');
    } else {
      console.log('\n✅ Success!');
    }
    
  } catch (error: any) {
    console.error('Error:', error);
    console.error('Error message:', error.message);
  } finally {
    await pool.end();
  }
}

testUpdateExact();

