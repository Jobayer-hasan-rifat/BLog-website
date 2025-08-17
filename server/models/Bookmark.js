const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Ensure a user can only bookmark a post once
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

// Populate post and user information when querying
bookmarkSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'post',
    select: 'title content author createdAt likesCount commentsCount'
  }).populate({
    path: 'user',
    select: 'name username avatarUrl'
  });
  next();
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
