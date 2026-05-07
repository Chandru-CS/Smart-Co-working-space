const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Space = require('../models/Space');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { bookingValidator } = require('../middleware/validators');
const {
  sendEmail,
  bookingConfirmationEmail,
  bookingStatusEmail,
  newBookingNotifyOwner,
} = require('../utils/emailService');

const calculateTotal = (space, bookingType, startDate, endDate) => {
  const start = new Date(startDate), end = new Date(endDate);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays  = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.ceil(diffDays / 30);
  if (bookingType === 'hourly')  return (space.pricing.hourly  || 0) * diffHours;
  if (bookingType === 'daily')   return (space.pricing.daily   || 0) * diffDays;
  if (bookingType === 'monthly') return (space.pricing.monthly || 0) * diffMonths;
  return 0;
};

// POST /api/bookings
router.post('/', protect, bookingValidator, async (req, res) => {
  try {
    const { spaceId, bookingType, startDate, endDate, startTime, endTime, numberOfPersons, specialRequests } = req.body;

    const space = await Space.findById(spaceId).populate('owner', 'name email');
    if (!space) return res.status(404).json({ success: false, message: 'Space not found.' });
    if (!space.availability.isAvailable)
      return res.status(400).json({ success: false, message: 'Space is not available.' });
    if (numberOfPersons > space.seatingCapacity)
      return res.status(400).json({ success: false, message: `Max capacity is ${space.seatingCapacity} persons.` });

    const conflict = await Booking.findOne({
      space: spaceId, status: { $in: ['approved', 'pending'] },
      $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }],
    });
    if (conflict) return res.status(400).json({ success: false, message: 'Space already booked for these dates.' });

    const totalAmount = Math.round(calculateTotal(space, bookingType, startDate, endDate));
    const booking = await Booking.create({
      user: req.user._id, space: spaceId, owner: space.owner._id,
      bookingType, startDate, endDate, startTime, endTime, numberOfPersons, totalAmount, specialRequests,
    });

    // In-app notification to owner
    await User.findByIdAndUpdate(space.owner._id, {
      $push: { notifications: { message: `New booking request for "${space.name}" from ${req.user.name}`, type: 'booking' } },
    });

    // Emails
    sendEmail({ to: req.user.email, ...bookingConfirmationEmail({
      userName: req.user.name, spaceName: space.name, spaceCity: space.location.city,
      startDate, endDate, bookingType, totalAmount, bookingId: booking._id,
    })});
    sendEmail({ to: space.owner.email, ...newBookingNotifyOwner({
      ownerName: space.owner.name, userName: req.user.name, userCompany: req.user.company,
      spaceName: space.name, startDate, endDate, numberOfPersons, totalAmount,
    })});

    const io = req.app.get('io');
    io.to(`space_${spaceId}`).emit('new_booking', { spaceId, bookingId: booking._id });

    await booking.populate(['user', 'space', 'owner']);
    res.status(201).json({ success: true, data: booking });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// GET /api/bookings/my
router.get('/my', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate('space', 'name location images type pricing')
      .populate('owner', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// GET /api/bookings/owner
router.get('/owner', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = req.user.role === 'admin' ? {} : { owner: req.user._id };
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate('space', 'name location images')
      .populate('user', 'name email phone company')
      .sort('-createdAt');
    res.json({ success: true, data: bookings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('space').populate('user', 'name email phone').populate('owner', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      booking.owner._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) return res.status(403).json({ success: false, message: 'Not authorized.' });
    res.json({ success: true, data: booking });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// PUT /api/bookings/:id/status — owner approve/reject
router.put('/:id/status', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { status, statusNote } = req.body;
    if (!['approved','rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status.' });

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('space', 'name location');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (req.user.role === 'owner' && booking.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized.' });

    booking.status = status;
    booking.statusNote = statusNote || '';
    await booking.save();

    if (status === 'approved') await Space.findByIdAndUpdate(booking.space._id, { $inc: { totalBookings: 1 } });

    // In-app notification
    const msg = status === 'approved'
      ? `Your booking for "${booking.space.name}" has been approved! 🎉`
      : `Your booking for "${booking.space.name}" was rejected.${statusNote ? ` Reason: ${statusNote}` : ''}`;
    await User.findByIdAndUpdate(booking.user._id, {
      $push: { notifications: { message: msg, type: status === 'approved' ? 'approval' : 'rejection' } },
    });

    // Email
    sendEmail({ to: booking.user.email, ...bookingStatusEmail({
      userName: booking.user.name, spaceName: booking.space.name, status,
      statusNote, startDate: booking.startDate, endDate: booking.endDate, totalAmount: booking.totalAmount,
    })});

    const io = req.app.get('io');
    io.emit(`booking_update_${booking.user._id}`, { bookingId: booking._id, status });

    res.json({ success: true, data: booking });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    if (!['pending','approved'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking.' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
