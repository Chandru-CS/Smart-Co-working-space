const express = require('express');
const router = express.Router();
const Space = require('../models/Space');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// ─── GET /api/spaces ── Smart Search & Filtering ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      city,
      type,
      minPrice,
      maxPrice,
      capacity,
      area,
      amenities,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = { isActive: true };

    // Location filter
    if (city) query['location.city'] = { $regex: city, $options: 'i' };

    // Type filter
    if (type) query.type = type;

    // Pricing filter (daily)
    if (minPrice || maxPrice) {
      query['pricing.daily'] = {};
      if (minPrice) query['pricing.daily'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.daily'].$lte = Number(maxPrice);
    }

    // Capacity filter (minimum seats)
    if (capacity) query.seatingCapacity = { $gte: Number(capacity) };

    // Area filter (minimum sq ft)
    if (area) query['areaSize.value'] = { $gte: Number(area) };

    // Amenities filter (array of amenity IDs)
    if (amenities) {
      const amenityIds = amenities.split(',');
      query.amenities = { $all: amenityIds };
    }

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [spaces, total] = await Promise.all([
      Space.find(query)
        .populate('amenities', 'name icon category')
        .populate('owner', 'name email company')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Space.countDocuments(query),
    ]);

    // Recommendation score: sort by rating + bookings
    const scored = spaces.map((s) => ({
      ...s.toObject(),
      score: s.rating.average * 20 + Math.min(s.totalBookings, 50),
    }));

    res.json({
      success: true,
      count: spaces.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: scored,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/spaces/featured ─────────────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const spaces = await Space.find({ isActive: true, isFeatured: true })
      .populate('amenities', 'name icon')
      .populate('owner', 'name company')
      .limit(6)
      .sort('-rating.average');
    res.json({ success: true, data: spaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/spaces/popular ──────────────────────────────────────────────────
router.get('/popular', async (req, res) => {
  try {
    const spaces = await Space.find({ isActive: true })
      .populate('amenities', 'name icon')
      .populate('owner', 'name company')
      .sort('-totalBookings -rating.average')
      .limit(8);
    res.json({ success: true, data: spaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/spaces/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const space = await Space.findById(req.params.id)
      .populate('amenities')
      .populate('owner', 'name email phone company')
      .populate('reviews.user', 'name avatar');

    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found.' });
    }

    // Get current active bookings for this space
    const activeBookings = await Booking.find({
      space: space._id,
      status: { $in: ['approved', 'pending'] },
      endDate: { $gte: new Date() },
    }).select('startDate endDate status bookingType');

    res.json({ success: true, data: { ...space.toObject(), activeBookings } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/spaces ─── Owner creates space ─────────────────────────────────
router.post('/', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const spaceData = { ...req.body, owner: req.user._id };
    const space = await Space.create(spaceData);
    await space.populate('amenities', 'name icon');
    res.status(201).json({ success: true, data: space });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/spaces/:id ──────────────────────────────────────────────────────
router.put('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ success: false, message: 'Space not found.' });

    // Owners can only edit their own spaces
    if (req.user.role === 'owner' && space.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const updated = await Space.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('amenities', 'name icon');

    // Broadcast availability change via socket
    const io = req.app.get('io');
    io.to(`space_${req.params.id}`).emit('availability_update', {
      spaceId: req.params.id,
      isAvailable: updated.availability.isAvailable,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/spaces/:id ───────────────────────────────────────────────────
router.delete('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ success: false, message: 'Space not found.' });

    if (req.user.role === 'owner' && space.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Soft delete
    await Space.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Space removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/spaces/:id/review ──────────────────────────────────────────────
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ success: false, message: 'Space not found.' });

    // Check if user has booked this space
    const hasBooked = await Booking.findOne({
      user: req.user._id,
      space: req.params.id,
      status: 'completed',
    });

    if (!hasBooked) {
      return res.status(400).json({ success: false, message: 'You can only review spaces you have booked.' });
    }

    // Add review
    space.reviews.push({ user: req.user._id, rating, comment });

    // Recalculate average
    const total = space.reviews.reduce((sum, r) => sum + r.rating, 0);
    space.rating.average = (total / space.reviews.length).toFixed(1);
    space.rating.count = space.reviews.length;

    await space.save();
    res.json({ success: true, data: space });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/spaces/owner/my-spaces ──────────────────────────────────────────
router.get('/owner/my-spaces', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const ownerId = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const spaces = await Space.find({ ...ownerId, isActive: true })
      .populate('amenities', 'name icon')
      .sort('-createdAt');
    res.json({ success: true, data: spaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
