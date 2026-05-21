const router = require('express').Router();
const { createNotice, getNotices, updateNotice, deleteNotice } = require('../../controllers/notice.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createNoticeValidator, updateNoticeValidator } = require('../../validators/notice.validator');

router.use(authenticate);

router.post('/', authorize('admin', 'secretary'), createNoticeValidator, validate, createNotice);
router.get('/', getNotices);
router.put('/:id', authorize('admin', 'secretary'), updateNoticeValidator, validate, updateNotice);
router.delete('/:id', authorize('admin', 'secretary'), deleteNotice);

module.exports = router;
