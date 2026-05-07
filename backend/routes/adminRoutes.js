const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Space = require('../models/Space');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin
router.use(protect, authorize('admin'));

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalSpaces,
      totalBookings,
      pendingBookings,
      approvedBookings,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'owner' }),
      Space.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'approved' }),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt'),
    ]);

    // Revenue estimate
    const revenue = await Booking.aggregate([
      { $match: { status: { $in: ['approved', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOwners,
        totalSpaces,
        totalBookings,
        pendingBookings,
        approvedBookings,
        estimatedRevenue: revenue[0]?.total || 0,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/admin/users/:id ─── Toggle user active status ───────────────────
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/admin/spaces ─────────────────────────────────────────────────────
router.get('/spaces', async (req, res) => {
  try {
    const spaces = await Space.find()
      .populate('owner', 'name email')
      .populate('amenities', 'name icon')
      .sort('-createdAt');
    res.json({ success: true, data: spaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/admin/spaces/:id/feature ─── Toggle featured ────────────────────
router.put('/spaces/:id/feature', async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    space.isFeatured = !space.isFeatured;
    await space.save();
    res.json({ success: true, data: space });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/admin/bookings ───────────────────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('space', 'name location')
      .populate('owner', 'name email')
      .sort('-createdAt')
      .limit(100);
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
