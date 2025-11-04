const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Expense = require('../models/Expense');

describe('Expense API', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await Expense.deleteMany({});
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    });
    testUserId = user._id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'testpassword123'
      });
    authToken = loginResponse.body.token;

    // Clean up expenses
    await Expense.deleteMany({ user: testUserId });
  });

  describe('POST /api/expenses', () => {
    it('should create a new expense', async () => {
      const expenseData = {
        description: 'Test Expense',
        amount: 100,
        category: 'Food',
        date: '2024-01-15',
        notes: 'Test notes'
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);

      expect(response.body.description).toBe(expenseData.description);
      expect(response.body.amount).toBe(expenseData.amount);
      expect(response.body.category).toBe(expenseData.category);
      expect(response.body.user.toString()).toBe(testUserId.toString());
    });

    it('should not create expense without required fields', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Test' })
        .expect(500); // Will fail validation

      expect(response.body).toHaveProperty('message');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({
          description: 'Test',
          amount: 100,
          category: 'Food'
        })
        .expect(401);
    });
  });

  describe('GET /api/expenses', () => {
    beforeEach(async () => {
      // Create test expenses
      await Expense.create({
        user: testUserId,
        description: 'Expense 1',
        amount: 100,
        category: 'Food',
        date: new Date('2024-01-15')
      });
      await Expense.create({
        user: testUserId,
        description: 'Expense 2',
        amount: 200,
        category: 'Transportation',
        date: new Date('2024-01-20')
      });
    });

    it('should get all expenses for user', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter expenses by date range', async () => {
      const response = await request(app)
        .get('/api/expenses?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    let expenseId;

    beforeEach(async () => {
      const expense = await Expense.create({
        user: testUserId,
        description: 'Original Expense',
        amount: 100,
        category: 'Food',
        date: new Date()
      });
      expenseId = expense._id;
    });

    it('should update an expense', async () => {
      const updateData = {
        description: 'Updated Expense',
        amount: 150
      };

      const response = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.description).toBe(updateData.description);
      expect(response.body.amount).toBe(updateData.amount);
    });

    it('should not update expense of another user', async () => {
      // Create another user
      const otherUser = await User.create({
        name: 'Other User',
        email: `other${Date.now()}@example.com`,
        password: 'testpassword123'
      });

      const otherExpense = await Expense.create({
        user: otherUser._id,
        description: 'Other Expense',
        amount: 100,
        category: 'Food',
        date: new Date()
      });

      const response = await request(app)
        .put(`/api/expenses/${otherExpense._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Hacked' })
        .expect(404); // Not found because user doesn't own it
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    let expenseId;

    beforeEach(async () => {
      const expense = await Expense.create({
        user: testUserId,
        description: 'To Delete',
        amount: 100,
        category: 'Food',
        date: new Date()
      });
      expenseId = expense._id;
    });

    it('should delete an expense', async () => {
      await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      const expense = await Expense.findById(expenseId);
      expect(expense).toBeNull();
    });
  });
});


