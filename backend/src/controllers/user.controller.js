const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all users (with pagination & filtering)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.flatNumber) filter.flatNumber = req.query.flatNumber;

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  new ApiResponse(200, 'Users fetched successfully.', users, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  }).send(res);
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  new ApiResponse(200, 'User fetched successfully.', { user }).send(res);
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, flatNumber, phone, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (flatNumber !== undefined) user.flatNumber = flatNumber;
  if (phone !== undefined) user.phone = phone;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  new ApiResponse(200, 'User updated successfully.', { user }).send(res);
});

/**
 * @desc    Delete user (soft delete — deactivate)
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Soft delete
  user.isActive = false;
  await user.save();

  new ApiResponse(200, 'User deactivated successfully.').send(res);
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };
