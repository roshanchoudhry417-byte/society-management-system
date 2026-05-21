const request = require('supertest');
const app = require('../src/app');

require('./setup');

describe('Payment API', () => {
  let adminToken, residentToken;

  beforeEach(async () => {
    const adminRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin', email: 'admin@test.com', password: 'Admin@123', role: 'admin',
    });
    adminToken = adminRes.body.data.token;

    const residentRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Resident', email: 'resident@test.com', password: 'Resident@123', role: 'resident', flatNumber: 'A-101',
    });
    residentToken = residentRes.body.data.token;
  });

  describe('POST /api/v1/payments/create-order', () => {
    it('should create payment order as admin', async () => {
      const res = await request(app).post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 5000, dueDate: '2026-05-15', month: 'May', year: 2026 });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.payment.amount).toBe(5000);
      expect(res.body.data.payment.status).toBe('pending');
    });

    it('should reject from resident', async () => {
      const res = await request(app).post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ amount: 5000, dueDate: '2026-05-15' });
      expect(res.statusCode).toBe(403);
    });

    it('should reject missing amount', async () => {
      const res = await request(app).post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ dueDate: '2026-05-15' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/payments', () => {
    it('should return all payments for admin', async () => {
      const res = await request(app).get('/api/v1/payments')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject from resident', async () => {
      const res = await request(app).get('/api/v1/payments')
        .set('Authorization', `Bearer ${residentToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/payments/my', () => {
    it('should return own payments for resident', async () => {
      const res = await request(app).get('/api/v1/payments/my')
        .set('Authorization', `Bearer ${residentToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
