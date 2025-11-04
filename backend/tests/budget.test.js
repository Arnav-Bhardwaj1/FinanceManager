const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

describe('Budget API', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await Budget.deleteMany({});
    await Expense.deleteMany({});
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test user and get auth token
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

    // Clean up budgets and expenses
    await Budget.deleteMany({ user: testUserId });
    await Expense.deleteMany({ user: testUserId });
  });

  describe('POST /api/budgets', () => {
    it('should create a new budget', async () => {
      const budgetData = {
        category: 'Food',
        amount: 5000,
        month: '2024-01',
        description: 'Monthly food budget'
      };

      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(response.body.category).toBe(budgetData.category);
      expect(response.body.amount).toBe(budgetData.amount);
      expect(response.body.month).toBe(budgetData.month);
      expect(response.body.user.toString()).toBe(testUserId.toString());
    });

    it('should not create budget without required fields', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category: 'Food' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .send({
          category: 'Food',
          amount: 5000,
          month: '2024-01'
        })
        .expect(401);
    });
  });

  describe('GET /api/budgets', () => {
    beforeEach(async () => {
      // Create test budgets
      await Budget.create({
        user: testUserId,
        category: 'Food',
        amount: 5000,
        month: '2024-01'
      });
      await Budget.create({
        user: testUserId,
        category: 'Transportation',
        amount: 3000,
        month: '2024-01'
      });
    });

    it('should get all budgets for user', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter budgets by month', async () => {
      const response = await request(app)
        .get('/api/budgets?month=2024-01')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(budget => {
        expect(budget.month).toBe('2024-01');
      });
    });
  });

  describe('GET /api/budgets/statistics', () => {
    beforeEach(async () => {
      await Budget.create({
        user: testUserId,
        category: 'Food',
        amount: 5000,
        month: '2024-01'
      });
      await Budget.create({
        user: testUserId,
        category: 'Transportation',
        amount: 3000,
        month: '2024-01'
      });

      // Create some expenses
      await Expense.create({
        user: testUserId,
        category: 'Food',
        amount: 2000,
        date: new Date('2024-01-15'),
        description: 'Test expense'
      });
    });

    it('should get budget statistics', async () => {
      const response = await request(app)
        .get('/api/budgets/statistics?month=2024-01')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalBudget');
      expect(response.body).toHaveProperty('totalSpent');
      expect(response.body).toHaveProperty('totalRemaining');
      expect(response.body).toHaveProperty('overallUsage');
      expect(response.body).toHaveProperty('categoryBreakdown');
      expect(response.body.totalBudget).toBe(8000);
      expect(response.body.totalSpent).toBe(2000);
    });
  });
});


