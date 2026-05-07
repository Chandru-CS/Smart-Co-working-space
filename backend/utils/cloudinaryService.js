const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// ── Configure Cloudinary (using .env) ───────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log({
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET,
});
// ── Multer: store file in memory ────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ── Upload buffer to Cloudinary ─────────────────────────────────────
const uploadToCloudinary = (buffer, folder = 'cowork-spaces') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// ── Delete image from Cloudinary ────────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary Delete Error:', err);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};