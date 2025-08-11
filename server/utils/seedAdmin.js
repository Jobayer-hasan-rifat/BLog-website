const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@miniblog.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

module.exports = seedAdmin;
