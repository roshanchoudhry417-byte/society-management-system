const router = require('express').Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../../controllers/user.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

router.use(authenticate);

router.get('/', authorize('admin', 'secretary'), getUsers);
router.get('/:id', authorize('admin', 'secretary'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
