const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['hourly', 'daily', 'monthly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: String, // e.g. "09:00" for hourly bookings
    endTime: String,
    numberOfPersons: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    // Special requests from user
    specialRequests: {
      type: String,
      maxlength: 500,
    },
    // Rejection / cancellation reason
    statusNote: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
);

// Index for fast queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ space: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
