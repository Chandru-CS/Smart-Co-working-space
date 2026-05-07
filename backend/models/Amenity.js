const mongoose = require('mongoose');

// ─── Amenity Model ─────────────────────────────────────────────────────────────
const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String, // emoji or icon class
      default: '✓',
    },
    category: {
      type: String,
      enum: ['connectivity', 'facility', 'comfort', 'security', 'food', 'transport', 'other'],
      default: 'other',
    },
    description: String,
  },
  { timestamps: true }
);

// ─── Inquiry Model ─────────────────────────────────────────────────────────────
const inquirySchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['open', 'replied', 'closed'],
      default: 'open',
    },
    replies: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Amenity = mongoose.model('Amenity', amenitySchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = { Amenity, Inquiry };
