const ServiceRequest = require('../models/ServiceRequest');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const createServiceRequest = asyncHandler(async (req, res) => {
  const { type, description, scheduledDate } = req.body;
  const sr = await ServiceRequest.create({ userId: req.user._id, type, description, scheduledDate });
  new ApiResponse(201, 'Service request created.', { serviceRequest: sr }).send(res);
});

const getServiceRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = (req.user.role === 'admin' || req.user.role === 'secretary') ? {} : { userId: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  const [requests, total] = await Promise.all([
    ServiceRequest.find(filter).populate('userId', 'name email flatNumber').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ServiceRequest.countDocuments(filter),
  ]);
  new ApiResponse(200, 'Service requests fetched.', requests, { page, limit, total, pages: Math.ceil(total / limit) }).send(res);
});

const updateServiceRequest = asyncHandler(async (req, res) => {
  const sr = await ServiceRequest.findById(req.params.id);
  if (!sr) throw new ApiError(404, 'Service request not found.');
  const { status, assignedVendor, vendorPhone, estimatedCost, scheduledDate } = req.body;
  if (status) sr.status = status;
  if (assignedVendor) sr.assignedVendor = assignedVendor;
  if (vendorPhone) sr.vendorPhone = vendorPhone;
  if (estimatedCost !== undefined) sr.estimatedCost = estimatedCost;
  if (scheduledDate) sr.scheduledDate = scheduledDate;
  if (status === 'completed') sr.completedAt = new Date();
  await sr.save();
  new ApiResponse(200, 'Service request updated.', { serviceRequest: sr }).send(res);
});

const rateServiceRequest = asyncHandler(async (req, res) => {
  const sr = await ServiceRequest.findById(req.params.id);
  if (!sr) throw new ApiError(404, 'Service request not found.');
  if (sr.userId.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not authorized.');
  if (sr.status !== 'completed') throw new ApiError(400, 'Can only rate completed requests.');
  const { rating, ratingComment } = req.body;
  sr.rating = rating;
  sr.ratingComment = ratingComment;
  await sr.save();
  new ApiResponse(200, 'Rating submitted.', { serviceRequest: sr }).send(res);
});

module.exports = { createServiceRequest, getServiceRequests, updateServiceRequest, rateServiceRequest };
