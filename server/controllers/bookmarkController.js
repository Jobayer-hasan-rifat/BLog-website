const Bookmark = require('../models/Bookmark');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get user's bookmarked posts
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const bookmarks = await Bookmark.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bookmark.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add bookmark
// @route   POST /api/bookmarks
// @access  Private
const addBookmark = async (req, res, next) => {
  try {
    const { postId, note } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      post: postId
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'Post already bookmarked'
      });
    }

    const bookmark = await Bookmark.create({
      user: req.user.id,
      post: postId,
      note
    });

    res.status(201).json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:postId
// @access  Private
const removeBookmark = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.id,
      post: postId
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bookmark note
// @route   PUT /api/bookmarks/:postId
// @access  Private
const updateBookmark = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { note } = req.body;

    const bookmark = await Bookmark.findOneAndUpdate(
      { user: req.user.id, post: postId },
      { note },
      { new: true, runValidators: true }
    );

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookmarks,
  addBookmark,
  removeBookmark,
  updateBookmark
};
