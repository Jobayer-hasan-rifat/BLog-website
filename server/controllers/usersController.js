const { validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const fs = require('fs');
const path = require('path');

// @desc    Get my profile
// @route   GET /api/users/profile
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, user: req.user });
    }
    const user = await User.findById(req.user.id).select('-resetPasswordToken -resetPasswordExpire');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update my profile (name, username, email, password)
// @route   PUT /api/users/profile
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin profile is not editable.' });
    }
    const { name, username, email, currentPassword, newPassword, bio, location, website, avatarUrl } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (website !== undefined) updates.website = website;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required' });
      }
      const ok = await user.comparePassword(currentPassword);
      if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      user.password = newPassword;
    }

    Object.assign(user, updates);
    await user.save();

    res.status(200).json({ success: true, user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role, bio: user.bio, location: user.location, website: user.website, avatarUrl: user.avatarUrl } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete my account
// @route   DELETE /api/users/profile
// @access  Private
const deleteMyAccount = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin account cannot be deleted.' });
    }
    await Post.deleteMany({ author: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Public profile with posts
// @route   GET /api/users/:id
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name username createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, user, posts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  getPublicProfile
};

// Admin controllers
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-resetPasswordToken -resetPasswordExpire -password');
    res.status(200).json({ success: true, users });
  } catch (error) { next(error); }
};

const adminUpdateUser = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};

const adminDeleteUser = async (req, res, next) => {
  try {
    await Post.deleteMany({ author: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) { next(error); }
};

// My posts
const getMyPosts = async (req, res, next) => {
  try {
    const query = (req.user.role === 'admin' && req.user.id === 'admin')
      ? {}
      : { author: req.user.id };
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (error) { next(error); }
};

module.exports.listUsers = listUsers;
module.exports.adminUpdateUser = adminUpdateUser;
module.exports.adminDeleteUser = adminDeleteUser;
module.exports.getMyPosts = getMyPosts;


