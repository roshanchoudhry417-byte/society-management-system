const request = require('supertest');
const app = require('../src/app');

require('./setup');

describe('Complaint API', () => {
  let residentToken, adminToken;

  beforeEach(async () => {
    // Register admin
    const adminRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin', email: 'admin@test.com', password: 'Admin@123', role: 'admin',
    });
    adminToken = adminRes.body.data.token;

    // Register resident
    const residentRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Resident', email: 'resident@test.com', password: 'Resident@123', role: 'resident', flatNumber: 'A-101',
    });
    residentToken = residentRes.body.data.token;
  });

  describe('POST /api/v1/complaints', () => {
    it('should create a complaint as resident', async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ title: 'Broken pipe', description: 'Water leaking in bathroom', priority: 'high' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.complaint).toHaveProperty('title', 'Broken pipe');
      expect(res.body.data.complaint.status).toBe('open');
    });

    it('should reject complaint from admin', async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test', description: 'Test description' });
      expect(res.statusCode).toBe(403);
    });

    it('should reject complaint without title', async () => {
      const res = await request(app)
        .post('/api/v1/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ description: 'Missing title' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/complaints', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ title: 'Issue 1', description: 'Desc 1' });
    });

    it('should return complaints for admin', async () => {
      const res = await request(app).get('/api/v1/complaints').set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return own complaints for resident', async () => {
      const res = await request(app).get('/api/v1/complaints').set('Authorization', `Bearer ${residentToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PUT /api/v1/complaints/:id', () => {
    it('should update complaint status as admin', async () => {
      const createRes = await request(app).post('/api/v1/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ title: 'Issue', description: 'Desc' });
      const id = createRes.body.data.complaint._id;

      const res = await request(app).put(`/api/v1/complaints/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in-progress' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.complaint.status).toBe('in-progress');
    });

    it('should reject update from resident', async () => {
      const createRes = await request(app).post('/api/v1/complaints')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ title: 'Issue', description: 'Desc' });
      const id = createRes.body.data.complaint._id;

      const res = await request(app).put(`/api/v1/complaints/${id}`)
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ status: 'resolved' });
      expect(res.statusCode).toBe(403);
    });
  });
});
