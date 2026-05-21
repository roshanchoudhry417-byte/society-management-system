const { body } = require('express-validator');

const createPollValidator = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ max: 500 })
    .withMessage('Question cannot exceed 500 characters'),
  body('options')
    .isArray({ min: 2, max: 10 })
    .withMessage('A poll must have between 2 and 10 options'),
  body('options.*.text')
    .trim()
    .notEmpty()
    .withMessage('Each option must have text'),
  body('expiresAt').optional().isISO8601().withMessage('Expiry date must be a valid date'),
];

const voteValidator = [
  body('optionId').notEmpty().withMessage('Option ID is required'),
];

module.exports = { createPollValidator, voteValidator };
