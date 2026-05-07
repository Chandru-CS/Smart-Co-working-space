const express = require('express');
const router = express.Router();
const { Amenity } = require('../models/Amenity');
const { protect, authorize } = require('../middleware/auth');

// GET all amenities
router.get('/', async (req, res) => {
  try {
    const amenities = await Amenity.find().sort('category name');
    res.json({ success: true, data: amenities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create amenity (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const amenity = await Amenity.create(req.body);
    res.status(201).json({ success: true, data: amenity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE amenity (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Amenity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Amenity deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
