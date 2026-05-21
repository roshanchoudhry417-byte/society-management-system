const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidAt: {
      type: Date,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: 'Monthly Maintenance',
      trim: true,
    },
    month: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
