const { body } = require('express-validator');

const createBookingValidator = [
  body('amenity')
    .notEmpty()
    .withMessage('Amenity is required')
    .isIn(['gym', 'clubhouse', 'swimming-pool', 'party-hall', 'tennis-court', 'garden'])
    .withMessage('Invalid amenity'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('timeSlot')
    .notEmpty()
    .withMessage('Time slot is required')
    .isIn([
      '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
      '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00',
    ])
    .withMessage('Invalid time slot'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

module.exports = { createBookingValidator };
