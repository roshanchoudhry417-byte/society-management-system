const router = require('express').Router();
const { createOrder, verifyPayment, getAllPayments, getMyPayments } = require('../../controllers/payment.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createPaymentValidator, verifyPaymentValidator } = require('../../validators/payment.validator');

router.use(authenticate);

router.post('/create-order', createPaymentValidator, validate, createOrder);
router.post('/verify', verifyPaymentValidator, validate, verifyPayment);
router.get('/', authorize('admin', 'secretary'), getAllPayments);
router.get('/my', getMyPayments);

module.exports = router;
