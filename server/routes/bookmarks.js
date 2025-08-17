const express = require('express');
const {
  getBookmarks,
  addBookmark,
  removeBookmark,
  updateBookmark
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All bookmark routes require authentication
router.use(protect);

// Get user's bookmarks and add new bookmark
router.route('/')
  .get(getBookmarks)
  .post(addBookmark);

// Bookmark operations for specific posts
router.route('/:postId')
  .put(updateBookmark)
  .delete(removeBookmark);

module.exports = router;
