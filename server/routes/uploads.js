const express = require('express');
const path = require('path');
const { protect } = require('../middleware/auth');
const { upload, uploadAvatar, baseUploads } = require('../utils/upload');

const router = express.Router();

router.post('/', protect, upload.array('files', 5), (req, res) => {
  const files = req.files || [];
  const data = files.map((f) => ({ filename: f.filename, url: `/uploads/files/${f.filename}` }));
  res.status(200).json({ success: true, files: data });
});

router.post('/avatar', protect, uploadAvatar.single('file'), (req, res) => {
  const f = req.file;
  if (!f) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.status(200).json({ success: true, file: { filename: f.filename, url: `/uploads/avatars/${f.filename}` } });
});

module.exports = router;


