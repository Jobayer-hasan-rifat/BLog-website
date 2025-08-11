const jwt = require('jsonwebtoken');

// Generate JWT token from arbitrary payload
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Build JWT payload
  const payload = user._id
    ? { id: user._id }
    : { id: user.id };

  if (user.role) payload.role = user.role;
  if (user.isAdmin) payload.isAdmin = true;

  const token = generateToken(payload);

  const options = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

module.exports = {
  generateToken,
  sendTokenResponse
};
