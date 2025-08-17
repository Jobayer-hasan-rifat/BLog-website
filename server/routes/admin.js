const express = require('express');
const {
  getAdminStats,
  getAllUsers,
  toggleUserBan,
  deletePostAdmin,
  deleteCommentAdmin,
  togglePostFeature,
  getLeaderboard
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Admin dashboard and stats
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/ban', toggleUserBan);

// Content moderation
router.delete('/posts/:postId', deletePostAdmin);
router.delete('/comments/:commentId', deleteCommentAdmin);
router.put('/posts/:postId/feature', togglePostFeature);

// Public leaderboard endpoint (no auth required)
router.get('/leaderboard', getLeaderboard);

module.exports = router;
