const Notice = require('../models/Notice');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const createNotice = asyncHandler(async (req, res) => {
  const { title, description, category, expiresAt } = req.body;
  const notice = await Notice.create({ title, description, category, expiresAt, postedBy: req.user._id });
  const io = req.app.get('io');
  if (io) io.emit('notice:new', notice);
  new ApiResponse(201, 'Notice posted.', { notice }).send(res);
});

const getNotices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  const [notices, total] = await Promise.all([
    Notice.find(filter).populate('postedBy', 'name').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Notice.countDocuments(filter),
  ]);
  new ApiResponse(200, 'Notices fetched.', notices, { page, limit, total, pages: Math.ceil(total / limit) }).send(res);
});

const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) throw new ApiError(404, 'Notice not found.');
  const { title, description, category, isActive, expiresAt } = req.body;
  if (title) notice.title = title;
  if (description) notice.description = description;
  if (category) notice.category = category;
  if (isActive !== undefined) notice.isActive = isActive;
  if (expiresAt) notice.expiresAt = expiresAt;
  await notice.save();
  new ApiResponse(200, 'Notice updated.', { notice }).send(res);
});

const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) throw new ApiError(404, 'Notice not found.');
  await notice.deleteOne();
  new ApiResponse(200, 'Notice deleted.').send(res);
});

module.exports = { createNotice, getNotices, updateNotice, deleteNotice };
