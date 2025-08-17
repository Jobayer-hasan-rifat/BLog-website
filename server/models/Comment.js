const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide comment content'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: true
  },
  // For comment likes
  likesCount: {
    type: Number,
    default: 0
  },
  likedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  // For comment replies
  parentComment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
    default: null
  }
}, {
  timestamps: true
});

// Populate author information when querying
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name email username avatarUrl'
  });
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
