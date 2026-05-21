const { body } = require('express-validator');

const createVisitorValidator = [
  body('name').trim().notEmpty().withMessage('Visitor name is required'),
  body('flatNumber').trim().notEmpty().withMessage('Flat number is required'),
  body('phone').optional().trim(),
  body('purpose').optional().trim(),
  body('type')
    .optional()
    .isIn(['guest', 'delivery', 'cab', 'service', 'other'])
    .withMessage('Invalid visitor type'),
  body('vehicleNumber').optional().trim(),
];

module.exports = { createVisitorValidator };
