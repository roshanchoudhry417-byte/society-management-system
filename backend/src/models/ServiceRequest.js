const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      required: [true, 'Service type is required'],
      enum: {
        values: ['plumbing', 'electrical', 'cleaning', 'carpentry', 'painting', 'pest-control', 'other'],
        message: '{VALUE} is not a valid service type',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    assignedVendor: {
      type: String,
      trim: true,
    },
    vendorPhone: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    ratingComment: {
      type: String,
      trim: true,
      maxlength: [500, 'Rating comment cannot exceed 500 characters'],
    },
    estimatedCost: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceRequestSchema.index({ userId: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ type: 1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
