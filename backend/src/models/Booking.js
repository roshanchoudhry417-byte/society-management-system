const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amenity: {
      type: String,
      required: [true, 'Amenity is required'],
      enum: {
        values: ['gym', 'clubhouse', 'swimming-pool', 'party-hall', 'tennis-court', 'garden'],
        message: '{VALUE} is not a valid amenity',
      },
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: {
        values: [
          '06:00-08:00',
          '08:00-10:00',
          '10:00-12:00',
          '12:00-14:00',
          '14:00-16:00',
          '16:00-18:00',
          '18:00-20:00',
          '20:00-22:00',
        ],
        message: '{VALUE} is not a valid time slot',
      },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double-booking: unique compound index on amenity + date + timeSlot
bookingSchema.index({ amenity: 1, date: 1, timeSlot: 1 }, { unique: true });
bookingSchema.index({ userId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
