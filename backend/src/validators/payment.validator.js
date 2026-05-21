const { body } = require('express-validator');

const createPaymentValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Amount must be positive'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('description').optional().trim(),
  body('month').optional().trim(),
  body('year').optional().isNumeric(),
];

const verifyPaymentValidator = [
  body('razorpayOrderId').notEmpty().withMessage('Razorpay Order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay Payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay Signature is required'),
];

module.exports = { createPaymentValidator, verifyPaymentValidator };
