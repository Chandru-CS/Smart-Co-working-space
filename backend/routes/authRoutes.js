const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../middleware/validators');
const { sendEmail, welcomeEmail } = require('../utils/emailService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
router.post('/register', registerValidator, async (req, res) => {
  try {
    const { name, email, password, role, phone, company } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const allowedRoles = ['user', 'owner'];
    const userRole = allowedRoles.includes(role) ? role : 'user';
    const user = await User.create({ name, email, password, role: userRole, phone, company });
    const token = generateToken(user._id);

    // Send welcome email (non-blocking)
    sendEmail({ to: email, ...welcomeEmail({ name, role: userRole }) });

    res.status(201).json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, company: user.company, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', loginValidator, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated.' });

    const token = generateToken(user._id);
    res.json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, company: user.company, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, company } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, company }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
