const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only follow another user once
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Prevent self-following
followSchema.pre('save', function(next) {
  if (this.follower.equals(this.following)) {
    const error = new Error('Users cannot follow themselves');
    return next(error);
  }
  next();
});

// Populate user information when querying
followSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'follower',
    select: 'name username avatarUrl'
  }).populate({
    path: 'following',
    select: 'name username avatarUrl'
  });
  next();
});

module.exports = mongoose.model('Follow', followSchema);
