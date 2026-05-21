const Visitor = require('../models/Visitor');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateOTP = require('../utils/generateOTP');

const createVisitor = asyncHandler(async (req, res) => {
  const { name, phone, flatNumber, purpose, type, vehicleNumber } = req.body;
  const otp = generateOTP(6);
  const visitorData = { name, phone, flatNumber, purpose, type: type || 'guest', vehicleNumber, otp };

  if (req.user.role === 'resident') {
    visitorData.residentId = req.user._id;
    visitorData.status = 'approved';
    visitorData.approvedBy = req.user._id;
  } else {
    visitorData.status = 'pending';
  }

  const visitor = await Visitor.create(visitorData);
  const io = req.app.get('io');
  if (io) io.to(`flat:${flatNumber}`).emit('visitor:arrival', visitor);
  console.log(`📱 OTP for visitor ${name}: ${otp}`);

  new ApiResponse(201, 'Visitor entry created.', {
    visitor, otp: req.user.role === 'resident' ? otp : undefined,
  }).send(res);
});

const getVisitors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.flatNumber) filter.flatNumber = req.query.flatNumber;
  if (req.user.role === 'resident') filter.flatNumber = req.user.flatNumber;
  if (req.query.today === 'true' || req.user.role === 'guard') {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    filter.createdAt = { $gte: today, $lt: tomorrow };
  }
  const [visitors, total] = await Promise.all([
    Visitor.find(filter).populate('residentId','name flatNumber').skip(skip).limit(limit).sort({createdAt:-1}),
    Visitor.countDocuments(filter),
  ]);
  new ApiResponse(200, 'Visitors fetched.', visitors, { page, limit, total, pages: Math.ceil(total/limit) }).send(res);
});

const approveVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) throw new ApiError(404, 'Visitor not found.');
  if (visitor.status !== 'pending') throw new ApiError(400, `Visitor is already ${visitor.status}.`);
  visitor.status = 'approved'; visitor.approvedBy = req.user._id; visitor.entryTime = new Date();
  await visitor.save();
  const io = req.app.get('io');
  if (io) io.to(`flat:${visitor.flatNumber}`).emit('visitor:approved', visitor);
  new ApiResponse(200, 'Visitor approved.', { visitor }).send(res);
});

const rejectVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) throw new ApiError(404, 'Visitor not found.');
  visitor.status = 'rejected'; await visitor.save();
  new ApiResponse(200, 'Visitor rejected.', { visitor }).send(res);
});

const checkoutVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) throw new ApiError(404, 'Visitor not found.');
  if (visitor.status !== 'approved') throw new ApiError(400, 'Visitor must be approved before checkout.');
  visitor.status = 'checked-out'; visitor.exitTime = new Date(); await visitor.save();
  new ApiResponse(200, 'Visitor checked out.', { visitor }).send(res);
});

module.exports = { createVisitor, getVisitors, approveVisitor, rejectVisitor, checkoutVisitor };
