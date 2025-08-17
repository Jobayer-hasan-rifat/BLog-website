const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Create a comment on a post
// @route   POST /api/posts/:postId/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { content, parentComment } = req.body;
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let comment = await Comment.create({
      content,
      author: req.user.id,
      post: postId,
      parentComment: parentComment || null
    });

    post.comments.push(comment._id);
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    comment = await comment.populate('author', 'name avatarUrl');

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const allComments = await Comment.find({ post: postId })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: 'asc' });

    const commentMap = {};
    const nestedComments = [];

    allComments.forEach(comment => {
      const commentObj = comment.toObject();
      commentObj.replies = [];
      commentMap[commentObj._id] = commentObj;
    });

    allComments.forEach(comment => {
      if (comment.parentComment) {
        if (commentMap[comment.parentComment]) {
          commentMap[comment.parentComment].replies.push(commentMap[comment._id]);
        }
      } else {
        nestedComments.push(commentMap[comment._id]);
      }
    });

    res.status(200).json({ success: true, count: nestedComments.length, data: nestedComments });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike a comment
// @route   POST /api/posts/:postId/comments/:commentId/like
// @access  Private
const toggleCommentLike = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const isLiked = comment.likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
      comment.likesCount = (comment.likesCount || 1) - 1;
    } else {
      // Like
      comment.likedBy.push(userId);
      comment.likesCount = (comment.likesCount || 0) + 1;
    }

    await comment.save();

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  toggleCommentLike
};
