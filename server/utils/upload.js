const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const baseUploads = path.join(__dirname, '..', 'public', 'uploads');
ensureDir(baseUploads);
ensureDir(path.join(baseUploads, 'avatars'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(baseUploads, 'files');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(baseUploads, 'avatars');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { upload, uploadAvatar, baseUploads };


