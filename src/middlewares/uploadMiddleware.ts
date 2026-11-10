
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirectory = path.join(process.cwd(), 'uploads');

// Membuat folder uploads jika belum tersedia
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  },
});

// Validasi tipe file
const fileFilter: multer.Options['fileFilter'] = (
  _req,
  file,
  cb
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP, and PDF files are allowed.'));
  }
};

// Konfigurasi upload
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB
  },
});
