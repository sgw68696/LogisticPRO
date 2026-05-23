const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'src', 'uploads'));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Unsupported file type'));
  }

  return cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
