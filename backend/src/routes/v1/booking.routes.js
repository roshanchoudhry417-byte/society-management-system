const router = require('express').Router();
const { createBooking, getBookings, getMyBookings, cancelBooking } = require('../../controllers/booking.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createBookingValidator } = require('../../validators/booking.validator');

router.use(authenticate);

router.post('/', authorize('resident'), createBookingValidator, validate, createBooking);
router.get('/', authorize('admin', 'secretary'), getBookings);
router.get('/my', getMyBookings);
router.delete('/:id', cancelBooking);

module.exports = router;
