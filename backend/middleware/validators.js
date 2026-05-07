const { body, param, query, validationResult } = require('express-validator');

// ── Middleware: run after validation chain, send errors if any ─────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }
  next();
};

// ── Auth Validators ────────────────────────────────────────────────────────────
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'owner']).withMessage('Role must be user or owner'),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  validate,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// ── Space Validators ──────────────────────────────────────────────────────────
const spaceValidator = [
  body('name').trim().notEmpty().withMessage('Space name is required')
    .isLength({ max: 150 }).withMessage('Name cannot exceed 150 characters'),
  body('type')
    .isIn(['private_cabin','shared_desk','meeting_room','event_space','virtual_office'])
    .withMessage('Invalid space type'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('seatingCapacity').isInt({ min: 1 }).withMessage('Seating capacity must be at least 1'),
  body('areaSize.value').isFloat({ min: 1 }).withMessage('Area size must be positive'),
  body('pricing.daily').optional().isFloat({ min: 0 }).withMessage('Daily price must be a positive number'),
  validate,
];

// ── Booking Validators ────────────────────────────────────────────────────────
const bookingValidator = [
  body('spaceId').isMongoId().withMessage('Invalid space ID'),
  body('bookingType').isIn(['hourly','daily','monthly']).withMessage('Invalid booking type'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('numberOfPersons').isInt({ min: 1 }).withMessage('Number of persons must be at least 1'),
  validate,
];

// ── Review Validator ──────────────────────────────────────────────────────────
const reviewValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  spaceValidator,
  bookingValidator,
  reviewValidator,
};
