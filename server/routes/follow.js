const express = require('express');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus
} = require('../controllers/followController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Follow/Unfollow routes
router.route('/:userId')
  .post(protect, followUser)
  .delete(protect, unfollowUser);

// Get followers and following
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/:userId/status', protect, getFollowStatus);

module.exports = router;
