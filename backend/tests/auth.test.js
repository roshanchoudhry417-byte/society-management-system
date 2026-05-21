const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

require('./setup');

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@123',
    role: 'resident',
    flatNumber: 'A-101',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
      expect(res.body.data).toHaveProperty('token');
      // Password should not be in response
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({ email: 'a@b.com' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject weak password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        ...testUser, email: 'weak@test.com', password: 'abc',
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(testUser);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email, password: testUser.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should reject wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email, password: 'WrongPass1',
      });
      expect(res.statusCode).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@test.com', password: 'Test@123',
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toBe(401);
    });
  });
});
