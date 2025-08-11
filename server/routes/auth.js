const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', [body('email').isEmail()], forgotPassword);
router.put('/resetpassword/:resettoken', [body('password').isLength({ min: 6 })], resetPassword);

module.exports = router;
