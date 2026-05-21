const crypto = require('crypto');
const Payment = require('../models/Payment');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

// Conditionally initialize Razorpay
let razorpayInstance = null;
try {
  if (config.razorpay.keyId && config.razorpay.keySecret &&
      !config.razorpay.keyId.includes('placeholder')) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
} catch (err) {
  console.warn('⚠️ Razorpay not configured. Payment features will be limited.');
}

/**
 * @desc    Create a payment order (Razorpay)
 * @route   POST /api/v1/payments/create-order
 * @access  Private/Admin
 */
const createOrder = asyncHandler(async (req, res) => {
  const { amount, dueDate, description, month, year, userId } = req.body;

  // Target user is either specified (admin creating for resident) or self
  const targetUserId = req.user.role === 'admin' ? (userId || req.user._id) : req.user._id;

  // Create payment record in DB
  const payment = await Payment.create({
    userId: targetUserId,
    amount,
    dueDate,
    description: description || 'Monthly Maintenance',
    month,
    year,
    status: 'pending',
  });

  // Create Razorpay order if configured
  let razorpayOrder = null;
  if (razorpayInstance) {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: payment._id.toString(),
    });
    payment.razorpayOrderId = razorpayOrder.id;
  } else {
    payment.razorpayOrderId = 'order_mock_' + payment._id.toString();
  }
  await payment.save();

  new ApiResponse(201, 'Payment order created.', {
    payment,
    razorpayOrder,
    razorpayKeyId: config.razorpay.keyId,
  }).send(res);
});

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/v1/payments/verify
 * @access  Private
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  // Find payment by razorpay order ID
  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) {
    throw new ApiError(404, 'Payment order not found.');
  }

  // Verify signature
  if (razorpayInstance) {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      payment.status = 'failed';
      await payment.save();
      throw new ApiError(400, 'Payment verification failed. Invalid signature.');
    }
  }

  // Update payment as completed
  payment.status = 'completed';
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.paidAt = new Date();
  payment.transactionId = razorpayPaymentId;
  await payment.save();

  new ApiResponse(200, 'Payment verified successfully.', { payment }).send(res);
});

/**
 * @desc    Get all payments (admin)
 * @route   GET /api/v1/payments
 * @access  Private/Admin
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.userId) filter.userId = req.query.userId;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('userId', 'name email flatNumber')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Payment.countDocuments(filter),
  ]);

  new ApiResponse(200, 'Payments fetched.', payments, {
    page, limit, total, pages: Math.ceil(total / limit),
  }).send(res);
});

/**
 * @desc    Get my payments (resident)
 * @route   GET /api/v1/payments/my
 * @access  Private
 */
const getMyPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { userId: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [payments, total] = await Promise.all([
    Payment.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Payment.countDocuments(filter),
  ]);

  new ApiResponse(200, 'My payments fetched.', payments, {
    page, limit, total, pages: Math.ceil(total / limit),
  }).send(res);
});

module.exports = { createOrder, verifyPayment, getAllPayments, getMyPayments };
