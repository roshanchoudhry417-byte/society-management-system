const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Poll question is required'],
      trim: true,
      maxlength: [500, 'Question cannot exceed 500 characters'],
    },
    options: {
      type: [pollOptionSchema],
      validate: {
        validator: function (v) {
          return v.length >= 2 && v.length <= 10;
        },
        message: 'A poll must have between 2 and 10 options',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Track who voted to prevent double-voting
    votedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index
pollSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Poll', pollSchema);
