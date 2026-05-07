/**
 * Seed script - populates the database with sample data
 * Run with: node utils/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Space = require('../models/Space');
const Booking = require('../models/Booking');
const { Amenity } = require('../models/Amenity');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cowork_platform';

const amenitiesData = [
  { name: 'High-Speed Wi-Fi', icon: '📶', category: 'connectivity' },
  { name: 'Ethernet Ports', icon: '🔌', category: 'connectivity' },
  { name: 'Meeting Rooms', icon: '🏢', category: 'facility' },
  { name: 'Printing/Scanning', icon: '🖨️', category: 'facility' },
  { name: 'Whiteboards', icon: '📋', category: 'facility' },
  { name: 'Air Conditioning', icon: '❄️', category: 'comfort' },
  { name: 'Standing Desks', icon: '🪑', category: 'comfort' },
  { name: 'Lounge Area', icon: '🛋️', category: 'comfort' },
  { name: '24/7 Access', icon: '🔑', category: 'security' },
  { name: 'CCTV Security', icon: '📷', category: 'security' },
  { name: 'Biometric Entry', icon: '🔐', category: 'security' },
  { name: 'Cafeteria', icon: '☕', category: 'food' },
  { name: 'Vending Machines', icon: '🥤', category: 'food' },
  { name: 'Parking', icon: '🅿️', category: 'transport' },
  { name: 'Bike Storage', icon: '🚲', category: 'transport' },
  { name: 'Power Backup', icon: '⚡', category: 'other' },
  { name: 'Projector', icon: '📽️', category: 'facility' },
  { name: 'Phone Booths', icon: '📞', category: 'facility' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany(),
    Space.deleteMany(),
    Booking.deleteMany(),
    Amenity.deleteMany(),
  ]);
  console.log('Cleared existing data');

  // Create amenities
  const amenities = await Amenity.insertMany(amenitiesData);
  console.log(`Created ${amenities.length} amenities`);

  // Create users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@cowork.com',
    password: 'admin123',
    role: 'admin',
  });

  const owner1 = await User.create({
    name: 'Priya Sharma',
    email: 'priya@spaces.com',
    password: 'owner123',
    role: 'owner',
    company: 'HubSpace Pvt Ltd',
    phone: '9876543210',
  });

  const owner2 = await User.create({
    name: 'Rahul Mehta',
    email: 'rahul@spaces.com',
    password: 'owner123',
    role: 'owner',
    company: 'WorkNest Solutions',
    phone: '9876543211',
  });

  const user1 = await User.create({
    name: 'Arjun Patel',
    email: 'arjun@example.com',
    password: 'user123',
    role: 'user',
    company: 'TechStartup Inc',
  });

  const user2 = await User.create({
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    password: 'user123',
    role: 'user',
  });

  console.log('Created users');

  // Helper to get amenity IDs by name
  const getAmenityIds = (names) =>
    amenities.filter((a) => names.includes(a.name)).map((a) => a._id);

  // Create spaces
  const spaces = await Space.insertMany([
    {
      owner: owner1._id,
      name: 'The Innovation Hub',
      description: 'A premium co-working space in the heart of Bangalore with state-of-the-art facilities for startups and growing teams.',
      location: { address: '12 MG Road, Ashok Nagar', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      type: 'shared_desk',
      areaSize: { value: 3500 },
      seatingCapacity: 80,
      pricing: { hourly: 150, daily: 800, monthly: 12000 },
      amenities: getAmenityIds(['High-Speed Wi-Fi', 'Meeting Rooms', 'Cafeteria', 'Air Conditioning', 'Parking', 'Power Backup']),
      images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', caption: 'Main floor' }],
      rating: { average: 4.8, count: 42 },
      totalBookings: 156,
      isFeatured: true,
    },
    {
      owner: owner1._id,
      name: 'Executive Suite - HSR Layout',
      description: 'Private cabins for teams who need focus and privacy. Fully furnished executive suites in HSR Layout.',
      location: { address: '27 Sector 6, HSR Layout', city: 'Bangalore', state: 'Karnataka', pincode: '560102' },
      type: 'private_cabin',
      areaSize: { value: 800 },
      seatingCapacity: 10,
      pricing: { hourly: 400, daily: 2500, monthly: 45000 },
      amenities: getAmenityIds(['High-Speed Wi-Fi', 'Air Conditioning', 'CCTV Security', '24/7 Access', 'Parking', 'Biometric Entry']),
      images: [{ url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', caption: 'Private cabin' }],
      rating: { average: 4.6, count: 18 },
      totalBookings: 67,
      isFeatured: true,
    },
    {
      owner: owner2._id,
      name: 'WorkNest Koramangala',
      description: 'Vibrant co-working space in Koramangala, perfect for freelancers, remote workers and small teams.',
      location: { address: '5th Block, 80 Feet Road', city: 'Bangalore', state: 'Karnataka', pincode: '560095' },
      type: 'shared_desk',
      areaSize: { value: 2200 },
      seatingCapacity: 50,
      pricing: { hourly: 120, daily: 600, monthly: 8000 },
      amenities: getAmenityIds(['High-Speed Wi-Fi', 'Printing/Scanning', 'Lounge Area', 'Cafeteria', 'Air Conditioning']),
      images: [{ url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', caption: 'Open workspace' }],
      rating: { average: 4.4, count: 31 },
      totalBookings: 89,
      isFeatured: false,
    },
    {
      owner: owner2._id,
      name: 'BoardRoom Pro - Indiranagar',
      description: 'Professional meeting rooms equipped with the latest AV equipment. Perfect for client presentations and team meetings.',
      location: { address: '100 Feet Road, Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
      type: 'meeting_room',
      areaSize: { value: 600 },
      seatingCapacity: 20,
      pricing: { hourly: 500, daily: 3500 },
      amenities: getAmenityIds(['High-Speed Wi-Fi', 'Projector', 'Whiteboards', 'Air Conditioning', 'Ethernet Ports']),
      images: [{ url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800', caption: 'Meeting room' }],
      rating: { average: 4.9, count: 55 },
      totalBookings: 210,
      isFeatured: true,
    },
    {
      owner: owner1._id,
      name: 'Freelancer Corner - Whitefield',
      description: 'Budget-friendly co-working space designed for individual freelancers and remote workers.',
      location: { address: 'EPIP Zone, Whitefield', city: 'Bangalore', state: 'Karnataka', pincode: '560066' },
      type: 'shared_desk',
      areaSize: { value: 1200 },
      seatingCapacity: 30,
      pricing: { hourly: 80, daily: 400, monthly: 5000 },
      amenities: getAmenityIds(['High-Speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Vending Machines']),
      images: [{ url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800', caption: 'Workspace' }],
      rating: { average: 4.2, count: 24 },
      totalBookings: 78,
    },
    {
      owner: owner2._id,
      name: 'TechHub Pune - Hinjewadi',
      description: 'Modern co-working space in the IT hub of Pune, close to major tech companies.',
      location: { address: 'Phase 1, Hinjewadi', city: 'Pune', state: 'Maharashtra', pincode: '411057' },
      type: 'shared_desk',
      areaSize: { value: 4000 },
      seatingCapacity: 100,
      pricing: { hourly: 100, daily: 550, monthly: 7500 },
      amenities: getAmenityIds(['High-Speed Wi-Fi', 'Parking', 'Cafeteria', 'Air Conditioning', '24/7 Access', 'Power Backup']),
      images: [{ url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', caption: 'Pune office' }],
      rating: { average: 4.5, count: 38 },
      totalBookings: 134,
      isFeatured: true,
    },
  ]);

  console.log(`Created ${spaces.length} spaces`);

  // Create bookings
  await Booking.insertMany([
    {
      user: user1._id,
      space: spaces[0]._id,
      owner: owner1._id,
      bookingType: 'daily',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-05'),
      numberOfPersons: 3,
      totalAmount: 3200,
      status: 'completed',
    },
    {
      user: user1._id,
      space: spaces[3]._id,
      owner: owner2._id,
      bookingType: 'hourly',
      startDate: new Date('2025-07-10'),
      endDate: new Date('2025-07-10'),
      startTime: '10:00',
      endTime: '14:00',
      numberOfPersons: 8,
      totalAmount: 2000,
      status: 'approved',
    },
    {
      user: user2._id,
      space: spaces[2]._id,
      owner: owner2._id,
      bookingType: 'monthly',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-31'),
      numberOfPersons: 2,
      totalAmount: 8000,
      status: 'pending',
    },
  ]);

  console.log('Created bookings');
  console.log('\n✅ Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:  admin@cowork.com / admin123');
  console.log('  Owner:  priya@spaces.com / owner123');
  console.log('  Owner:  rahul@spaces.com / owner123');
  console.log('  User:   arjun@example.com / user123');
  console.log('  User:   sneha@example.com / user123');

  mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  mongoose.disconnect();
});
