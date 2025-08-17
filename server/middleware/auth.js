const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If admin token, try to map to real admin user to ensure valid ObjectId
    if (decoded.isAdmin) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@miniblog.com';
      let adminUser = null;

      if (decoded.id) {
        adminUser = await User.findById(decoded.id).catch(() => null);
      }
      if (!adminUser) {
        adminUser = await User.findOne({ email: adminEmail, role: 'admin' });
      }

      // If still not found, auto-create admin DB user so downstream code has a valid ObjectId
      if (!adminUser) {
        try {
          adminUser = await User.create({
            name: 'Admin',
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'admin'
          });
        } catch (e) {
          // If a race created it, fetch again
          adminUser = await User.findOne({ email: adminEmail, role: 'admin' });
        }
      }

      if (adminUser) {
        req.user = {
          id: adminUser._id.toString(),
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        };
        return next();
      }

      // Fallback to synthetic admin if no DB user is found
      req.user = {
        id: 'admin',
        name: 'Admin',
        email: 'admin@miniblog.com',
        role: 'admin'
      };
      return next();
    }

    // Get user from token for non-admin
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
