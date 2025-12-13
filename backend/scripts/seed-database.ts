import '../src/config/database';
import pool from '../src/config/database';
import bcrypt from 'bcryptjs';

const sampleSweets = [
  { name: 'Chocolate Bar', category: 'Chocolate', price: 2.50, quantity: 100 },
  { name: 'Gummy Bears', category: 'Gummies', price: 1.50, quantity: 150 },
  { name: 'Lollipop', category: 'Hard Candy', price: 0.75, quantity: 200 },
  { name: 'Caramel Toffee', category: 'Toffee', price: 3.00, quantity: 80 },
  { name: 'Jelly Beans', category: 'Gummies', price: 2.00, quantity: 120 },
  { name: 'Marshmallow', category: 'Soft Candy', price: 1.25, quantity: 90 },
  { name: 'Licorice', category: 'Hard Candy', price: 1.75, quantity: 60 },
  { name: 'Fudge', category: 'Chocolate', price: 4.50, quantity: 50 },
  { name: 'Rock Candy', category: 'Hard Candy', price: 1.00, quantity: 110 },
  { name: 'Truffle', category: 'Chocolate', price: 5.00, quantity: 40 },
];

// Default admin user for testing/review
const DEFAULT_ADMIN = {
  email: 'admin@sweetshop.com',
  password: 'admin123',
  role: 'admin'
};

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');
    
    // Create default admin user if it doesn't exist
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [DEFAULT_ADMIN.email]
    );
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        [DEFAULT_ADMIN.email, hashedPassword, DEFAULT_ADMIN.role]
      );
      console.log(`✅ Created default admin user:`);
      console.log(`   Email: ${DEFAULT_ADMIN.email}`);
      console.log(`   Password: ${DEFAULT_ADMIN.password}`);
      console.log(`   Role: ${DEFAULT_ADMIN.role}\n`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${DEFAULT_ADMIN.email}\n`);
    }
    
    // Check if sweets already exist
    const existing = await pool.query('SELECT COUNT(*) as count FROM sweets');
    const count = existing.rows[0]?.count || 0;
    
    if (count > 0) {
      console.log(`Database already has ${count} sweets. Skipping sweet seeding.`);
      console.log(`\n📝 Default Admin Credentials:`);
      console.log(`   Email: ${DEFAULT_ADMIN.email}`);
      console.log(`   Password: ${DEFAULT_ADMIN.password}`);
      return;
    }
    
    // Insert sample sweets
    console.log('Adding sample sweets...');
    for (const sweet of sampleSweets) {
      await pool.query(
        'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)',
        [sweet.name, sweet.category, sweet.price, sweet.quantity]
      );
      console.log(`Added: ${sweet.name}`);
    }
    
    console.log(`\n✅ Successfully seeded ${sampleSweets.length} sweets!`);
    console.log(`\n📝 Default Admin Credentials:`);
    console.log(`   Email: ${DEFAULT_ADMIN.email}`);
    console.log(`   Password: ${DEFAULT_ADMIN.password}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedDatabase();
