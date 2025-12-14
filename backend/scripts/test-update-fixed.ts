import '../src/config/database';
import pool from '../src/config/database';

async function testUpdateFixed() {
  try {
    const id = 3; // Lollipop
    const name = 'Lollipop Test';
    const category = 'Hard Candy';
    const price = 1.75;
    const quantity = 199;
    
    console.log(`Testing UPDATE for sweet ID ${id}...\n`);
    
    // Build query exactly like the FIXED controller does
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
    
    // Add updated_at (doesn't need a parameter, so don't increment paramCount)
    updates.push(`updated_at = NOW()`);
    
    // Add the ID parameter
    paramCount++;
    values.push(id);
    const query = `UPDATE sweets SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    console.log('Query:', query);
    console.log('Values:', values);
    console.log('Expected: WHERE id = $5 (paramCount should be 5)');
    console.log('Actual paramCount:', paramCount);
    
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
  } finally {
    await pool.end();
  }
}

testUpdateFixed();

