const Booking = require('../models/Booking');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const createBooking = asyncHandler(async (req, res) => {
  const { amenity, date, timeSlot, notes } = req.body;
  // Check for existing booking (unique index handles this, but give a nicer error)
  const existing = await Booking.findOne({ amenity, date: new Date(date), timeSlot, status: 'confirmed' });
  if (existing) throw new ApiError(400, 'This slot is already booked. Please choose a different time.');
  const booking = await Booking.create({ userId: req.user._id, amenity, date, timeSlot, notes });
  new ApiResponse(201, 'Amenity booked successfully.', { booking }).send(res);
});

const getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.amenity) filter.amenity = req.query.amenity;
  if (req.query.date) filter.date = new Date(req.query.date);
  if (req.query.status) filter.status = req.query.status;
  const [bookings, total] = await Promise.all([
    Booking.find(filter).populate('userId', 'name email flatNumber').skip(skip).limit(limit).sort({ date: -1 }),
    Booking.countDocuments(filter),
  ]);
  new ApiResponse(200, 'Bookings fetched.', bookings, { page, limit, total, pages: Math.ceil(total / limit) }).send(res);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id }).sort({ date: -1 });
  new ApiResponse(200, 'My bookings fetched.', bookings).send(res);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to cancel this booking.');
  }
  booking.status = 'cancelled'; await booking.save();
  new ApiResponse(200, 'Booking cancelled.', { booking }).send(res);
});

module.exports = { createBooking, getBookings, getMyBookings, cancelBooking };
