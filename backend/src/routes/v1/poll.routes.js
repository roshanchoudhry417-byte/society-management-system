const router = require('express').Router();
const { createPoll, getPolls, votePoll, closePoll } = require('../../controllers/poll.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createPollValidator, voteValidator } = require('../../validators/poll.validator');

router.use(authenticate);

router.post('/', createPollValidator, validate, createPoll);
router.get('/', getPolls);
router.post('/:id/vote', authorize('resident'), voteValidator, validate, votePoll);
router.put('/:id/close', authorize('admin', 'secretary'), closePoll);

module.exports = router;
