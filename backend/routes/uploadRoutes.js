const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../utils/cloudinaryService');

/**
 * POST /api/upload/space-image
 * Upload 1–5 images
 */
router.post(
  '/space-image',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 5), // ✅ field name = "images"
  async (req, res) => {
    try {
      // 🔥 DEBUG (remove later)
      console.log("FILES:", req.files);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded.',
        });
      }

      // Upload to Cloudinary
      const uploads = await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.buffer, 'cowork-spaces')
        )
      );

      const images = uploads.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
      }));

      res.json({
        success: true,
        images,
      });

    } catch (err) {
      console.error('[Upload error]', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Upload failed.',
      });
    }
  }
);

/**
 * POST /api/upload/avatar
 */
router.post(
  '/avatar',
  protect,
  upload.single('avatar'), // ✅ field name = "avatar"
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image uploaded.',
        });
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        'cowork-avatars'
      );

      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, {
        avatar: result.secure_url,
      });

      res.json({
        success: true,
        url: result.secure_url,
      });

    } catch (err) {
      console.error('[Avatar error]', err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;