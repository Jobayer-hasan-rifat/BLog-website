const express = require('express');
const { body } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getDrafts,
  publishPost,
  toggleBookmark,
  reSharePost,
  incrementShareCount,
  getPersonalizedFeed,
  getPostLikes
} = require('../controllers/postsController');
const {
  createComment,
  getComments,
  toggleCommentLike
} = require('../controllers/commentsController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation rules
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required')
];

// Special routes (must come before /:id routes)
router.get('/drafts', protect, getDrafts);
router.get('/feed', protect, getPersonalizedFeed);

router.route('/')
  .get(getPosts)
  .post(protect, upload.single('media'), postValidation, createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, postValidation, updatePost)
  .delete(protect, deletePost);

// Post interaction routes
router.post('/:id/like', protect, toggleLike);
router.get('/:id/likes', getPostLikes);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/reshare', protect, reSharePost);
router.post('/:id/share', incrementShareCount);
router.put('/:id/publish', protect, publishPost);

// Comments routes
router.route('/:postId/comments')
  .post(protect, createComment)
  .get(getComments);

router.post('/:postId/comments/:commentId/like', protect, toggleCommentLike);

module.exports = router;
