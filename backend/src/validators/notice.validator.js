const { body } = require('express-validator');

const createNoticeValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'maintenance', 'event', 'emergency', 'meeting'])
    .withMessage('Invalid category'),
  body('expiresAt').optional().isISO8601().withMessage('Expiry date must be a valid date'),
];

const updateNoticeValidator = [
  body('title').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('category')
    .optional()
    .isIn(['general', 'maintenance', 'event', 'emergency', 'meeting']),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

module.exports = { createNoticeValidator, updateNoticeValidator };
