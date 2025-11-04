const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Authentication API', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  afterAll(async () => {
    // Clean up test database
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({ email: /test.*@example\.com/ });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      };

      // Create user first
      await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password
      });

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should require all fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await User.create({
        name: 'Test User',
        email: 'testlogin@example.com',
        password: 'testpassword123'
      });
    });

    it('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'testpassword123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('testlogin@example.com');
      authToken = response.body.token;
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testlogin@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});


