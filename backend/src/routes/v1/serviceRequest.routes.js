const router = require('express').Router();
const { createServiceRequest, getServiceRequests, updateServiceRequest, rateServiceRequest } = require('../../controllers/serviceRequest.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createServiceRequestValidator, updateServiceRequestValidator, rateServiceRequestValidator } = require('../../validators/serviceRequest.validator');

router.use(authenticate);

router.post('/', authorize('resident'), createServiceRequestValidator, validate, createServiceRequest);
router.get('/', getServiceRequests);
router.put('/:id', authorize('admin', 'secretary'), updateServiceRequestValidator, validate, updateServiceRequest);
router.post('/:id/rate', authorize('resident'), rateServiceRequestValidator, validate, rateServiceRequest);

module.exports = router;
