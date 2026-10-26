/**
 * MedulloSight — Multer Upload Configuration
 * Memory storage for fast buffering, streaming to Python service, and sanitization.
 */

import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/tiff',
    'image/bmp',
    'image/x-ms-bmp',
    'application/dicom',
    'application/octet-stream'
  ];

  const allowedExtensions = /\.(jpe?g|png|tiff?|bmp|webp|dcm)$/i;

  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(allowedExtensions)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported image format: ${file.originalname}. Please upload JPG, PNG, TIFF, BMP, WebP, or DICOM.`), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30 MB maximum file limit
  },
  fileFilter
});
