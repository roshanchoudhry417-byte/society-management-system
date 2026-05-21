const router = require('express').Router();
const { register, login, getMe, updatePassword, addVehicle } = require('../../controllers/auth.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { registerValidator, loginValidator } = require('../../validators/auth.validator');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', authenticate, getMe);
router.put('/update-password', authenticate, updatePassword);
router.post('/me/vehicles', authenticate, addVehicle);

module.exports = router;
