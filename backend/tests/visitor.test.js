const request = require('supertest');
const app = require('../src/app');

require('./setup');

describe('Visitor API', () => {
  let residentToken, guardToken;

  beforeEach(async () => {
    const residentRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Resident', email: 'resident@test.com', password: 'Resident@123', role: 'resident', flatNumber: 'A-101',
    });
    residentToken = residentRes.body.data.token;

    const guardRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Guard', email: 'guard@test.com', password: 'Guard@123', role: 'guard',
    });
    guardToken = guardRes.body.data.token;
  });

  describe('POST /api/v1/visitors', () => {
    it('should create visitor as resident (auto-approved)', async () => {
      const res = await request(app).post('/api/v1/visitors')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ name: 'Guest', flatNumber: 'A-101', phone: '1234567890' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.visitor.status).toBe('approved');
      expect(res.body.data).toHaveProperty('otp');
    });

    it('should create visitor as guard (pending)', async () => {
      const res = await request(app).post('/api/v1/visitors')
        .set('Authorization', `Bearer ${guardToken}`)
        .send({ name: 'Delivery Person', flatNumber: 'B-202', type: 'delivery' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.visitor.status).toBe('pending');
    });
  });

  describe('PUT /api/v1/visitors/:id/approve', () => {
    it('should approve visitor as guard', async () => {
      const createRes = await request(app).post('/api/v1/visitors')
        .set('Authorization', `Bearer ${guardToken}`)
        .send({ name: 'Guest', flatNumber: 'A-101' });
      const id = createRes.body.data.visitor._id;

      const res = await request(app).put(`/api/v1/visitors/${id}/approve`)
        .set('Authorization', `Bearer ${guardToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.visitor.status).toBe('approved');
    });

    it('should reject approval from resident', async () => {
      const createRes = await request(app).post('/api/v1/visitors')
        .set('Authorization', `Bearer ${guardToken}`)
        .send({ name: 'Guest', flatNumber: 'A-101' });
      const id = createRes.body.data.visitor._id;

      const res = await request(app).put(`/api/v1/visitors/${id}/approve`)
        .set('Authorization', `Bearer ${residentToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/v1/visitors/:id/checkout', () => {
    it('should checkout approved visitor', async () => {
      const createRes = await request(app).post('/api/v1/visitors')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ name: 'Guest', flatNumber: 'A-101' });
      const id = createRes.body.data.visitor._id;

      const res = await request(app).put(`/api/v1/visitors/${id}/checkout`)
        .set('Authorization', `Bearer ${guardToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.visitor.status).toBe('checked-out');
    });
  });
});
