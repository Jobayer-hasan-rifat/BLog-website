const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Bookmark = require('../models/Bookmark');

// @desc    Get all posts with filtering and sorting
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const { 
      sortBy = 'latest', 
      category, 
      tag, 
      status = 'published',
      author,
      page = 1,
      limit = 10,
      search
    } = req.query;

    // Build query
    let query = { status };
    
    if (category) query.categories = { $in: [category] };
    if (tag) query.tags = { $in: [tag] };
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'latest':
        sortOptions = { createdAt: -1 };
        break;
      case 'mostLiked':
        sortOptions = { likesCount: -1, createdAt: -1 };
        break;
      case 'mostCommented':
        sortOptions = { commentsCount: -1, createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'name avatarUrl role')
      .populate('originalPost', 'title author createdAt');

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, feeling, location } = req.body;
    const newPostData = {
      title,
      content,
      feeling,
      location,
      author: req.user.id,
      attachments: [],
    };

    if (req.file) {
      newPostData.attachments.push({
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        path: req.file.path,
        fileType: req.file.mimetype.startsWith('image') ? 'image' : 'video',
        mimeType: req.file.mimetype,
      });
    }

    const post = await Post.create(newPostData);
    
    // Populate the author field before sending response
    await post.populate('author', 'name avatarUrl role');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner or admin
    const postAuthorId = post.author._id ? post.author._id.toString() : String(post.author);
    if (postAuthorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner or admin
    if (post.author._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user.id;

    // Ensure userId is a valid ObjectId before proceeding
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const hasLiked = post.likedBy.some((id) => id.toString() === userId);

    if (hasLiked) {
      // Unlike the post
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
    } else {
      // Like the post
      post.likedBy.push(userId);
    }

    post.likesCount = post.likedBy.length;
    await post.save();

    res.status(200).json({ success: true, data: { likesCount: post.likesCount, liked: !hasLiked } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's draft posts
// @route   GET /api/posts/drafts
// @access  Private
const getDrafts = async (req, res, next) => {
  try {
    const drafts = await Post.find({ 
      author: req.user.id, 
      status: 'draft' 
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: drafts.length,
      data: drafts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish a draft post
// @route   PUT /api/posts/:id/publish
// @access  Private
const publishPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to publish this post'
      });
    }

    post.status = 'published';
    await post.save();

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark on a post
// @route   POST /api/posts/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user.id;
    const postId = req.params.id;
    const hasBookmarked = post.bookmarkedBy.some(id => id.toString() === userId);

    if (hasBookmarked) {
      // Remove bookmark
      post.bookmarkedBy = post.bookmarkedBy.filter(id => id.toString() !== userId);
      await Bookmark.findOneAndDelete({ user: userId, post: postId });
    } else {
      // Add bookmark
      post.bookmarkedBy.push(userId);
      await Bookmark.create({ user: userId, post: postId });
    }

    post.bookmarksCount = post.bookmarkedBy.length;
    await post.save();

    res.status(200).json({ 
      success: true, 
      data: { 
        bookmarksCount: post.bookmarksCount, 
        bookmarked: !hasBookmarked 
      } 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Re-share a post
// @route   POST /api/posts/:id/reshare
// @access  Private
const reSharePost = async (req, res, next) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) {
      return res.status(404).json({ success: false, message: 'Original post not found' });
    }

    const { reShareComment } = req.body;

    const reShare = await Post.create({
      title: `Re-shared: ${originalPost.title}`,
      content: reShareComment || '',
      author: req.user.id,
      isReShare: true,
      originalPost: originalPost._id,
      reShareComment,
      status: 'published'
    });

    res.status(201).json({
      success: true,
      data: reShare
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment share count
// @route   POST /api/posts/:id/share
// @access  Public
const incrementShareCount = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { sharesCount: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      data: { sharesCount: post.sharesCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized feed (posts from followed users)
// @route   GET /api/posts/feed
// @access  Private
const getPersonalizedFeed = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('following');
    
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      $or: [
        { author: { $in: user.following } },
        { author: req.user.id }
      ],
      status: 'published'
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('author', 'name avatarUrl role')
    .populate('originalPost', 'title author createdAt');

    const total = await Post.countDocuments({
      $or: [
        { author: { $in: user.following } },
        { author: req.user.id }
      ],
      status: 'published'
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users who liked a post
// @route   GET /api/posts/:id/likes
// @access  Public
const getPostLikes = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('likedBy', 'name avatarUrl');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post.likedBy
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
