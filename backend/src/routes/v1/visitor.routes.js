const router = require('express').Router();
const { createVisitor, getVisitors, approveVisitor, rejectVisitor, checkoutVisitor } = require('../../controllers/visitor.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createVisitorValidator } = require('../../validators/visitor.validator');

router.use(authenticate);

router.post('/', authorize('resident', 'guard'), createVisitorValidator, validate, createVisitor);
router.get('/', getVisitors);
router.put('/:id/approve', authorize('guard'), approveVisitor);
router.put('/:id/reject', authorize('guard', 'resident'), rejectVisitor);
router.put('/:id/checkout', authorize('guard'), checkoutVisitor);

module.exports = router;
