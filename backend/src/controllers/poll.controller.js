const Poll = require('../models/Poll');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const createPoll = asyncHandler(async (req, res) => {
  const { question, options, expiresAt } = req.body;
  const formattedOptions = options.map((opt) => ({ text: typeof opt === 'string' ? opt : opt.text, votes: 0 }));
  const poll = await Poll.create({ question, options: formattedOptions, expiresAt, createdBy: req.user._id });
  const io = req.app.get('io');
  if (io) io.emit('poll:new', poll);
  new ApiResponse(201, 'Poll created.', { poll }).send(res);
});

const getPolls = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = { isActive: true };
  const [polls, total] = await Promise.all([
    Poll.find(filter).populate('createdBy', 'name').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Poll.countDocuments(filter),
  ]);
  new ApiResponse(200, 'Polls fetched.', polls, { page, limit, total, pages: Math.ceil(total / limit) }).send(res);
});

const votePoll = asyncHandler(async (req, res) => {
  const { optionId } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, 'Poll not found.');
  if (!poll.isActive) throw new ApiError(400, 'This poll is no longer active.');
  if (poll.expiresAt && new Date() > poll.expiresAt) {
    poll.isActive = false; await poll.save();
    throw new ApiError(400, 'This poll has expired.');
  }
  if (poll.votedBy.includes(req.user._id)) throw new ApiError(400, 'You have already voted on this poll.');
  const option = poll.options.id(optionId);
  if (!option) throw new ApiError(400, 'Invalid option.');
  option.votes += 1;
  poll.votedBy.push(req.user._id);
  await poll.save();
  new ApiResponse(200, 'Vote recorded.', { poll }).send(res);
});

const closePoll = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) throw new ApiError(404, 'Poll not found.');
  poll.isActive = false; await poll.save();
  new ApiResponse(200, 'Poll closed.', { poll }).send(res);
});

module.exports = { createPoll, getPolls, votePoll, closePoll };
