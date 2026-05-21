const { body } = require('express-validator');

const createServiceRequestValidator = [
  body('type')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'pest-control', 'other'])
    .withMessage('Invalid service type'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('scheduledDate').optional().isISO8601().withMessage('Scheduled date must be a valid date'),
];

const updateServiceRequestValidator = [
  body('status')
    .optional()
    .isIn(['pending', 'assigned', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('assignedVendor').optional().trim(),
  body('vendorPhone').optional().trim(),
  body('estimatedCost').optional().isNumeric().withMessage('Estimated cost must be a number'),
];

const rateServiceRequestValidator = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('ratingComment').optional().trim().isLength({ max: 500 }),
];

module.exports = {
  createServiceRequestValidator,
  updateServiceRequestValidator,
  rateServiceRequestValidator,
};
