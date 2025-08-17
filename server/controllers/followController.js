const Follow = require('../models/Follow');
const User = require('../models/User');

// @desc    Follow a user
// @route   POST /api/follow/:userId
// @access  Private
const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    if (userId === followerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Admin account cannot follow and cannot be followed
    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin cannot follow users' });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (userToFollow.role === 'admin') {
      return res.status(403).json({ success: false, message: 'You cannot follow an admin' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Create follow relationship
    await Follow.create({
      follower: followerId,
      following: userId
    });

    // Update user counts
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/follow/:userId
// @access  Private
const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Admin shouldn't have follow relations, but allow idempotent response
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, message: 'Nothing to unfollow' });
    }

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Not following this user'
      });
    }

    // Update user counts
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's followers
// @route   GET /api/follow/:userId/followers
// @access  Public
const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const followers = await Follow.find({ following: userId })
      .populate('follower', 'name username avatarUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ following: userId });

    res.status(200).json({
      success: true,
      count: followers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: followers.map(f => f.follower)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's following
// @route   GET /api/follow/:userId/following
// @access  Public
const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const following = await Follow.find({ follower: userId })
      .populate('following', 'name username avatarUrl')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ follower: userId });

    res.status(200).json({
      success: true,
      count: following.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: following.map(f => f.following)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user is following another user
// @route   GET /api/follow/:userId/status
// @access  Private
const getFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const isFollowing = await Follow.exists({
      follower: followerId,
      following: userId
    });

    res.status(200).json({
      success: true,
      data: { isFollowing: !!isFollowing }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus
};
