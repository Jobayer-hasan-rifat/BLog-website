const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { getMyProfile, updateMyProfile, deleteMyAccount, getPublicProfile, listUsers, adminUpdateUser, adminDeleteUser, getMyPosts } = require('../controllers/usersController');

const router = express.Router();

router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, [
  body('name').optional().isLength({ min: 2, max: 50 }),
  body('username').optional().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('newPassword').optional().isLength({ min: 6 })
], updateMyProfile);
router.delete('/profile', protect, deleteMyAccount);
router.get('/me/posts', protect, getMyPosts);

router.get('/:id', getPublicProfile);

// Admin routes
router.get('/', protect, authorize('admin'), listUsers);
router.put('/:id', protect, authorize('admin'), adminUpdateUser);
router.delete('/:id', protect, authorize('admin'), adminDeleteUser);

module.exports = router;


