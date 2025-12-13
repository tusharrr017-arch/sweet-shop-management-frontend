import request from 'supertest';
import app from '../index';
import pool from '../config/database';

describe('Sweets API', () => {
  let authToken: string;
  let adminToken: string;
  let testSweetId: number;

  beforeAll(async () => {
    // Create a regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@test.com',
        password: 'password123',
      });
    authToken = userResponse.body.token;

    // Create an admin user (manually set role in DB)
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });
    
    await pool.query("UPDATE users SET role = 'admin' WHERE email = 'admin@test.com'");
    
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });
    adminToken = adminResponse.body.token;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM sweets');
    await pool.query("DELETE FROM users WHERE email IN ('user@test.com', 'admin@test.com')");
    await pool.end();
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.50,
          quantity: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('sweet');
      expect(response.body.sweet.name).toBe('Chocolate Bar');
      expect(response.body.sweet.category).toBe('Chocolate');
      expect(response.body.sweet.price).toBe(2.5);
      expect(response.body.sweet.quantity).toBe(100);
      testSweetId = response.body.sweet.id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: 1.00,
          quantity: 10,
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Incomplete Sweet',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/sweets', () => {
    it('should get all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sweets');
      expect(Array.isArray(response.body.sweets)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Gummy Bears',
          category: 'Gummies',
          price: 1.50,
          quantity: 50,
        });
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Gummy')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBeGreaterThan(0);
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Gummies')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBeGreaterThan(0);
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=1&maxPrice=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.sweets)).toBe(true);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    it('should update a sweet', async () => {
      if (!testSweetId) {
        const createResponse = await request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Update Test',
            category: 'Test',
            price: 2.00,
            quantity: 100,
          });
        testSweetId = createResponse.body.sweet.id;
      }

      const response = await request(app)
        .put(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 3.00,
          quantity: 150,
        });

      expect(response.status).toBe(200);
      expect(response.body.sweet.price).toBe(3);
      expect(response.body.sweet.quantity).toBe(150);
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .put('/api/sweets/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 5.00,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should delete a sweet as admin', async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'To Delete',
          category: 'Test',
          price: 1.00,
          quantity: 10,
        });

      expect(createResponse.status).toBe(201);
      const deleteId = createResponse.body.sweet.id;

      const response = await request(app)
        .delete(`/api/sweets/${deleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin user', async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'To Delete 2',
          category: 'Test',
          price: 1.00,
          quantity: 10,
        });

      expect(createResponse.status).toBe(201);
      const deleteId = createResponse.body.sweet.id;

      const response = await request(app)
        .delete(`/api/sweets/${deleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should purchase a sweet', async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Purchase Test',
          category: 'Test',
          price: 1.00,
          quantity: 50,
        });

      expect(createResponse.status).toBe(201);
      const sweetId = createResponse.body.sweet.id;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(45);
      expect(response.body.purchased).toBe(5);
    });

    it('should return 400 if insufficient quantity', async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Low Stock',
          category: 'Test',
          price: 1.00,
          quantity: 5,
        });

      expect(createResponse.status).toBe(201);
      const sweetId = createResponse.body.sweet.id;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 10,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    it('should restock a sweet as admin', async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Restock Test',
          category: 'Test',
          price: 1.00,
          quantity: 10,
        });

      expect(createResponse.status).toBe(201);
      const sweetId = createResponse.body.sweet.id;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(60);
      expect(response.body.restocked).toBe(50);
    });

    it('should return 403 for non-admin user', async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Restock Test 2',
          category: 'Test',
          price: 1.00,
          quantity: 10,
        });

      expect(createResponse.status).toBe(201);
      const sweetId = createResponse.body.sweet.id;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 50,
        });

      expect(response.status).toBe(403);
    });
  });
});

