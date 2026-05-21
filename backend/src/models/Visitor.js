const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
      default: 'Visit',
    },
    flatNumber: {
      type: String,
      required: [true, 'Flat number is required'],
      trim: true,
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    entryTime: {
      type: Date,
    },
    exitTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'checked-out'],
        message: '{VALUE} is not a valid visitor status',
      },
      default: 'pending',
    },
    otp: {
      type: String,
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['guest', 'delivery', 'cab', 'service', 'other'],
      default: 'guest',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
visitorSchema.index({ flatNumber: 1 });
visitorSchema.index({ status: 1 });
visitorSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
