const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const publishedPosts = await Post.countDocuments({ status: 'published' });

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author createdAt status');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPosts,
          totalComments,
          bannedUsers,
          draftPosts,
          publishedPosts
        },
        recentActivity: {
          recentUsers,
          recentPosts
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'banned') query.isBanned = true;
    if (status === 'active') query.isBanned = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:userId/ban
// @access  Private (Admin only)
const toggleUserBan = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    user.isBanned = !user.isBanned;
    if (user.isBanned) {
      user.banReason = reason;
      user.banDate = new Date();
    } else {
      user.banReason = undefined;
      user.banDate = undefined;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any post (admin)
// @route   DELETE /api/admin/posts/:postId
// @access  Private (Admin only)
const deletePostAdmin = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Mark as moderated before deletion
    post.isModerated = true;
    post.moderatedBy = req.user.id;
    post.moderationReason = reason;
    await post.save();

    // Delete the post
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any comment (admin)
// @route   DELETE /api/admin/comments/:commentId
// @access  Private (Admin only)
const deleteCommentAdmin = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await comment.deleteOne();

    // Update post comment count
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Feature/Unfeature post
// @route   PUT /api/admin/posts/:postId/feature
// @access  Private (Admin only)
const togglePostFeature = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isFeatured = !post.isFeatured;
    if (post.isFeatured) {
      post.featuredDate = new Date();
    } else {
      post.featuredDate = undefined;
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: `Post ${post.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard data
// @route   GET /api/admin/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
  try {
    // Most liked posts (top 5)
    const mostLikedPosts = await Post.find({ status: 'published' })
      .sort({ likesCount: -1 })
      .limit(5)
      .select('title author likesCount createdAt');

    // Most active users (based on posts + likes + comments)
    const mostActiveUsers = await User.aggregate([
      {
        $addFields: {
          activityScore: {
            $add: ['$postsCount', '$likesGiven', '$commentsCount']
          }
        }
      },
      { $sort: { activityScore: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          username: 1,
          avatarUrl: 1,
          postsCount: 1,
          likesGiven: 1,
          commentsCount: 1,
          activityScore: 1
        }
      }
    ]);

    // Weekly picks (trending posts from last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyPicks = await Post.find({
      status: 'published',
      createdAt: { $gte: weekAgo }
    })
    .sort({ likesCount: -1, commentsCount: -1 })
    .limit(5)
    .select('title author likesCount commentsCount createdAt');

    res.status(200).json({
      success: true,
      data: {
        mostLikedPosts,
        mostActiveUsers,
        weeklyPicks
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserBan,
  deletePostAdmin,
  deleteCommentAdmin,
  togglePostFeature,
  getLeaderboard
};
