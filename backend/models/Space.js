const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, default: 'India' },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    type: {
      type: String,
      enum: ['private_cabin', 'shared_desk', 'meeting_room', 'event_space', 'virtual_office'],
      required: true,
    },
    areaSize: {
      value: { type: Number, required: true }, // in sq ft
      unit: { type: String, default: 'sqft' },
    },
    seatingCapacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    pricing: {
      hourly: { type: Number },
      daily: { type: Number },
      monthly: { type: Number },
      currency: { type: String, default: 'INR' },
    },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenity',
      },
    ],
    images: [
      {
        url: { type: String },
        caption: { type: String },
      },
    ],
    availability: {
      isAvailable: { type: Boolean, default: true },
      openTime: { type: String, default: '08:00' },
      closeTime: { type: String, default: '22:00' },
      workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search performance
spaceSchema.index({ 'location.city': 1, type: 1, 'pricing.daily': 1 });
spaceSchema.index({ name: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Space', spaceSchema);
