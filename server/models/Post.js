const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    trim: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  likedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  attachments: [
    {
      filename: String,
      url: String
    }
  ],
  comments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Comment'
  }],
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Populate author information when querying
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name email username avatarUrl'
  });
  next();
});

module.exports = mongoose.model('Post', postSchema);
