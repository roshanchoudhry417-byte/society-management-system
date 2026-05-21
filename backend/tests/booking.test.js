const request = require('supertest');
const app = require('../src/app');

require('./setup');

describe('Booking API', () => {
  let residentToken, adminToken;

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

  describe('POST /api/v1/bookings', () => {
    it('should book an amenity as resident', async () => {
      const res = await request(app).post('/api/v1/bookings')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ amenity: 'gym', date: '2026-05-10', timeSlot: '08:00-10:00' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.booking.amenity).toBe('gym');
      expect(res.body.data.booking.status).toBe('confirmed');
    });

    it('should prevent double booking', async () => {
      const bookingData = { amenity: 'clubhouse', date: '2026-05-10', timeSlot: '10:00-12:00' };
      await request(app).post('/api/v1/bookings')
        .set('Authorization', `Bearer ${residentToken}`).send(bookingData);

      const res = await request(app).post('/api/v1/bookings')
        .set('Authorization', `Bearer ${residentToken}`).send(bookingData);
      expect(res.statusCode).toBe(400);
    });

    it('should reject invalid amenity', async () => {
      const res = await request(app).post('/api/v1/bookings')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ amenity: 'invalid', date: '2026-05-10', timeSlot: '08:00-10:00' });
      expect(res.statusCode).toBe(400);
    });

    it('should reject booking from admin', async () => {
      const res = await request(app).post('/api/v1/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amenity: 'gym', date: '2026-05-10', timeSlot: '08:00-10:00' });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/bookings/my', () => {
    it('should return user bookings', async () => {
      await request(app).post('/api/v1/bookings')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ amenity: 'gym', date: '2026-05-10', timeSlot: '06:00-08:00' });

      const res = await request(app).get('/api/v1/bookings/my')
        .set('Authorization', `Bearer ${residentToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {
    it('should cancel own booking', async () => {
      const createRes = await request(app).post('/api/v1/bookings')
        .set('Authorization', `Bearer ${residentToken}`)
        .send({ amenity: 'gym', date: '2026-05-11', timeSlot: '08:00-10:00' });
      const id = createRes.body.data.booking._id;

      const res = await request(app).delete(`/api/v1/bookings/${id}`)
        .set('Authorization', `Bearer ${residentToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.booking.status).toBe('cancelled');
    });
  });
});
