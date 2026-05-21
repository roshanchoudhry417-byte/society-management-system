const Complaint = require('../models/Complaint');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a complaint
 * @route   POST /api/v1/complaints
 * @access  Private/Resident
 */
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, priority, category } = req.body;

  // Handle uploaded images
  const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

  const complaint = await Complaint.create({
    userId: req.user._id,
    title,
    description,
    priority,
    category,
    images,
  });

  // Emit socket event for admin
  const io = req.app.get('io');
  if (io) {
    io.to('admin').emit('complaint:new', complaint);
  }

  new ApiResponse(201, 'Complaint created successfully.', { complaint }).send(res);
});

/**
 * @desc    Get all complaints (admin) or own complaints (resident)
 * @route   GET /api/v1/complaints
 * @access  Private
 */
const getComplaints = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Admin and Secretary see all, resident sees own
  const filter = (req.user.role === 'admin' || req.user.role === 'secretary') ? {} : { userId: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('userId', 'name email flatNumber')
      .populate('assignedTo', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Complaint.countDocuments(filter),
  ]);

  new ApiResponse(200, 'Complaints fetched.', complaints, {
    page, limit, total, pages: Math.ceil(total / limit),
  }).send(res);
});

/**
 * @desc    Get single complaint
 * @route   GET /api/v1/complaints/:id
 * @access  Private
 */
const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('userId', 'name email flatNumber')
    .populate('assignedTo', 'name');

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  // Resident can only view own complaints
  if (req.user.role !== 'admin' && req.user.role !== 'secretary' && complaint.userId._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to view this complaint.');
  }

  new ApiResponse(200, 'Complaint fetched.', { complaint }).send(res);
});

/**
 * @desc    Update complaint (admin — status, assignment, notes)
 * @route   PUT /api/v1/complaints/:id
 * @access  Private/Admin
 */
const updateComplaint = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo, adminNotes } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  if (status) complaint.status = status;
  if (priority) complaint.priority = priority;
  if (assignedTo) complaint.assignedTo = assignedTo;
  if (adminNotes) complaint.adminNotes = adminNotes;
  if (status === 'resolved') complaint.resolvedAt = new Date();

  await complaint.save();

  // Emit socket event to notify the resident
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${complaint.userId}`).emit('complaint:update', complaint);
  }

  new ApiResponse(200, 'Complaint updated.', { complaint }).send(res);
});

/**
 * @desc    Delete complaint
 * @route   DELETE /api/v1/complaints/:id
 * @access  Private/Admin
 */
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  await complaint.deleteOne();

  new ApiResponse(200, 'Complaint deleted.').send(res);
});

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
};
