const router = require('express').Router();

// Import all v1 route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const paymentRoutes = require('./payment.routes');
const complaintRoutes = require('./complaint.routes');
const visitorRoutes = require('./visitor.routes');
const noticeRoutes = require('./notice.routes');
const pollRoutes = require('./poll.routes');
const bookingRoutes = require('./booking.routes');
const serviceRequestRoutes = require('./serviceRequest.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);
router.use('/complaints', complaintRoutes);
router.use('/visitors', visitorRoutes);
router.use('/notices', noticeRoutes);
router.use('/polls', pollRoutes);
router.use('/bookings', bookingRoutes);
router.use('/service-requests', serviceRequestRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Society Management API v1 is running.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

module.exports = router;
