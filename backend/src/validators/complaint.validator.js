const { body } = require('express-validator');

const createComplaintValidator = [
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
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .isIn(['maintenance', 'noise', 'parking', 'security', 'cleanliness', 'other'])
    .withMessage('Invalid category'),
];

const updateComplaintValidator = [
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('adminNotes').optional().trim(),
];

module.exports = { createComplaintValidator, updateComplaintValidator };
