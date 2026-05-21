const router = require('express').Router();
const { createComplaint, getComplaints, getComplaintById, updateComplaint, deleteComplaint } = require('../../controllers/complaint.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const upload = require('../../middlewares/upload.middleware');
const { createComplaintValidator, updateComplaintValidator } = require('../../validators/complaint.validator');

router.use(authenticate);

router.post('/', authorize('resident'), upload.array('images', 5), createComplaintValidator, validate, createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.put('/:id', authorize('admin', 'secretary'), updateComplaintValidator, validate, updateComplaint);
router.delete('/:id', authorize('admin', 'secretary'), deleteComplaint);

module.exports = router;
