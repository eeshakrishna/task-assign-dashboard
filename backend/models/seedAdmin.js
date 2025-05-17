const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust if needed
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        email: 'admin@example.com',
        password: hashed,
        role: 'admin'
      });
      await newAdmin.save();
      console.log('✅ Admin created');
    } else {
      console.log('⚠️ Admin already exists');
    }
    process.exit();
  })
  .catch(err => console.error(err));
