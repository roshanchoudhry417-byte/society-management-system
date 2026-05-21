const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const dns = require('dns');

// Override Node.js DNS resolution to use Google DNS, fixing MongoDB Atlas SRV blocking
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const config = require('../config/env');

// Import models
const User = require('../models/User');
const Notice = require('../models/Notice');
const Complaint = require('../models/Complaint');

const seedDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Notice.deleteMany({});
    await Complaint.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@society.com',
      password: 'Admin@123',
      role: 'admin',
      flatNumber: 'OFFICE',
      phone: '9999999999',
    });
    console.log(`👤 Admin created: ${admin.email} / Admin@123`);

    // Create Residents
    const resident1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@resident.com',
      password: 'Resident@123',
      role: 'resident',
      flatNumber: 'A-101',
      phone: '9876543210',
    });

    const resident2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@resident.com',
      password: 'Resident@123',
      role: 'resident',
      flatNumber: 'B-202',
      phone: '9876543211',
    });
    console.log(`👤 Residents created: rahul@resident.com, priya@resident.com / Resident@123`);

    // Create Guard
    const guard = await User.create({
      name: 'Ramesh Guard',
      email: 'guard@society.com',
      password: 'Guard@123',
      role: 'guard',
      phone: '9876543212',
    });
    console.log(`👤 Guard created: guard@society.com / Guard@123`);

    // Create sample notices
    await Notice.create([
      {
        title: 'Water Supply Maintenance',
        description: 'Water supply will be interrupted on May 5th from 10 AM to 2 PM for maintenance work.',
        category: 'maintenance',
        postedBy: admin._id,
      },
      {
        title: 'Annual General Meeting',
        description: 'Annual General Meeting scheduled for May 15th at 6 PM in the clubhouse. All residents are requested to attend.',
        category: 'meeting',
        postedBy: admin._id,
      },
    ]);
    console.log('📢 Sample notices created');

    // Create sample complaints
    await Complaint.create([
      {
        userId: resident1._id,
        title: 'Lift not working',
        description: 'The lift in Tower A has been out of service since yesterday.',
        priority: 'high',
        category: 'maintenance',
        status: 'open',
      },
      {
        userId: resident2._id,
        title: 'Parking issue',
        description: 'Someone is parking in my designated spot B-202.',
        priority: 'medium',
        category: 'parking',
        status: 'open',
      },
    ]);
    console.log('📝 Sample complaints created');

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Login credentials:');
    console.log('  Admin:    admin@society.com / Admin@123');
    console.log('  Resident: rahul@resident.com / Resident@123');
    console.log('  Resident: priya@resident.com / Resident@123');
    console.log('  Guard:    guard@society.com / Guard@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
