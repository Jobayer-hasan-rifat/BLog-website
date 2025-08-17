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
  // Rich text content for formatted posts
  richContent: {
    type: String,
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
      url: String,
      path: String,
      fileType: String,
      mimeType: String
    }
  ],
  comments: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Comment'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  // New fields for advanced features
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  categories: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  // Re-share functionality
  isReShare: { type: Boolean, default: false },
  originalPost: { type: mongoose.Schema.ObjectId, ref: 'Post' },
  reShareComment: { type: String, trim: true },
  // Bookmarking
  bookmarkedBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  bookmarksCount: { type: Number, default: 0 },
  // Sharing tracking
  sharesCount: { type: Number, default: 0 },
  // New fields for post composer
  feeling: { type: String, trim: true },
  location: { type: String, trim: true },
  // Featured/highlighted posts
  isFeatured: { type: Boolean, default: false },
  featuredDate: { type: Date },
  // Admin moderation
  isModerated: { type: Boolean, default: false },
  moderatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  moderationReason: { type: String }
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
