const express = require('express');
const { body } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike
} = require('../controllers/postsController');
const {
  createComment,
  getComments
} = require('../controllers/commentsController');
const { protect } = require('../middleware/auth');

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

router.route('/')
  .get(getPosts)
  .post(protect, postValidation, createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, postValidation, updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLike);

// Comments routes
router.route('/:postId/comments')
  .post(protect, createComment)
  .get(getComments);

module.exports = router;
