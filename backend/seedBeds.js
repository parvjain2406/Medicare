/**
 * Seed Beds Data
 * Populates the database with sample bed data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Bed } = require('./models/Bed');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for seeding beds'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// Bed data
const bedsData = [
    // General Ward - Floor 1
    { bedNumber: 'GW-101', wardType: 'General', floor: 1, pricePerDay: 1500, status: 'Available', features: ['AC', 'TV', 'Attached Bathroom'] },
    { bedNumber: 'GW-102', wardType: 'General', floor: 1, pricePerDay: 1500, status: 'Occupied', features: ['AC', 'TV', 'Attached Bathroom'] },
    { bedNumber: 'GW-103', wardType: 'General', floor: 1, pricePerDay: 1500, status: 'Available', features: ['AC', 'TV', 'Attached Bathroom'] },
    { bedNumber: 'GW-104', wardType: 'General', floor: 1, pricePerDay: 1200, status: 'Available', features: ['Fan', 'Shared Bathroom'] },
    { bedNumber: 'GW-105', wardType: 'General', floor: 1, pricePerDay: 1200, status: 'Occupied', features: ['Fan', 'Shared Bathroom'] },
    { bedNumber: 'GW-106', wardType: 'General', floor: 1, pricePerDay: 1200, status: 'Available', features: ['Fan', 'Shared Bathroom'] },

    // General Ward - Floor 2
    { bedNumber: 'GW-201', wardType: 'General', floor: 2, pricePerDay: 1500, status: 'Available', features: ['AC', 'TV', 'Attached Bathroom'] },
    { bedNumber: 'GW-202', wardType: 'General', floor: 2, pricePerDay: 1500, status: 'Occupied', features: ['AC', 'TV', 'Attached Bathroom'] },
    { bedNumber: 'GW-203', wardType: 'General', floor: 2, pricePerDay: 1500, status: 'Available', features: ['AC', 'TV', 'Attached Bathroom'] },
    { bedNumber: 'GW-204', wardType: 'General', floor: 2, pricePerDay: 1200, status: 'Available', features: ['Fan', 'Shared Bathroom'] },
    { bedNumber: 'GW-205', wardType: 'General', floor: 2, pricePerDay: 1200, status: 'Maintenance', features: ['Fan', 'Shared Bathroom'] },
    { bedNumber: 'GW-206', wardType: 'General', floor: 2, pricePerDay: 1200, status: 'Available', features: ['Fan', 'Shared Bathroom'] },

    // ICU - Floor 3
    { bedNumber: 'ICU-301', wardType: 'ICU', floor: 3, pricePerDay: 8000, status: 'Available', features: ['Ventilator', 'Heart Monitor', 'Central Oxygen', '24/7 Nursing'] },
    { bedNumber: 'ICU-302', wardType: 'ICU', floor: 3, pricePerDay: 8000, status: 'Occupied', features: ['Ventilator', 'Heart Monitor', 'Central Oxygen', '24/7 Nursing'] },
    { bedNumber: 'ICU-303', wardType: 'ICU', floor: 3, pricePerDay: 8000, status: 'Occupied', features: ['Ventilator', 'Heart Monitor', 'Central Oxygen', '24/7 Nursing'] },
    { bedNumber: 'ICU-304', wardType: 'ICU', floor: 3, pricePerDay: 8000, status: 'Available', features: ['Ventilator', 'Heart Monitor', 'Central Oxygen', '24/7 Nursing'] },
    { bedNumber: 'ICU-305', wardType: 'ICU', floor: 3, pricePerDay: 10000, status: 'Available', features: ['Ventilator', 'Heart Monitor', 'Central Oxygen', '24/7 Nursing', 'Private Room'] },
    { bedNumber: 'ICU-306', wardType: 'ICU', floor: 3, pricePerDay: 10000, status: 'Occupied', features: ['Ventilator', 'Heart Monitor', 'Central Oxygen', '24/7 Nursing', 'Private Room'] },

    // Emergency Ward - Ground Floor
    { bedNumber: 'ER-001', wardType: 'Emergency', floor: 0, pricePerDay: 3000, status: 'Available', features: ['Emergency Equipment', 'Quick Access'] },
    { bedNumber: 'ER-002', wardType: 'Emergency', floor: 0, pricePerDay: 3000, status: 'Occupied', features: ['Emergency Equipment', 'Quick Access'] },
    { bedNumber: 'ER-003', wardType: 'Emergency', floor: 0, pricePerDay: 3000, status: 'Available', features: ['Emergency Equipment', 'Quick Access'] },
    { bedNumber: 'ER-004', wardType: 'Emergency', floor: 0, pricePerDay: 3000, status: 'Available', features: ['Emergency Equipment', 'Quick Access'] },

    // Pediatric Ward - Floor 4
    { bedNumber: 'PED-401', wardType: 'Pediatric', floor: 4, pricePerDay: 2000, status: 'Available', features: ['AC', 'Play Area Access', 'Parent Bed'] },
    { bedNumber: 'PED-402', wardType: 'Pediatric', floor: 4, pricePerDay: 2000, status: 'Occupied', features: ['AC', 'Play Area Access', 'Parent Bed'] },
    { bedNumber: 'PED-403', wardType: 'Pediatric', floor: 4, pricePerDay: 2000, status: 'Available', features: ['AC', 'Play Area Access', 'Parent Bed'] },
    { bedNumber: 'PED-404', wardType: 'Pediatric', floor: 4, pricePerDay: 2000, status: 'Available', features: ['AC', 'Play Area Access', 'Parent Bed'] },

    // Maternity Ward - Floor 5
    { bedNumber: 'MAT-501', wardType: 'Maternity', floor: 5, pricePerDay: 3500, status: 'Available', features: ['AC', 'Private Room', 'Attached Bathroom', 'Baby Crib'] },
    { bedNumber: 'MAT-502', wardType: 'Maternity', floor: 5, pricePerDay: 3500, status: 'Occupied', features: ['AC', 'Private Room', 'Attached Bathroom', 'Baby Crib'] },
    { bedNumber: 'MAT-503', wardType: 'Maternity', floor: 5, pricePerDay: 3500, status: 'Available', features: ['AC', 'Private Room', 'Attached Bathroom', 'Baby Crib'] },
    { bedNumber: 'MAT-504', wardType: 'Maternity', floor: 5, pricePerDay: 2500, status: 'Available', features: ['AC', 'Shared Room', 'Baby Crib'] },
];

const seedBeds = async () => {
    try {
        // Clear existing beds
        await Bed.deleteMany({});
        console.log('Cleared existing beds');

        // Insert new beds
        const beds = await Bed.insertMany(bedsData);
        console.log(`✅ Inserted ${beds.length} beds`);

        // Summary
        const summary = await Bed.aggregate([
            { $group: { _id: '$wardType', count: { $sum: 1 } } }
        ]);
        console.log('\n📊 Beds Summary:');
        summary.forEach(s => console.log(`   ${s._id}: ${s.count} beds`));

        console.log('\n✅ Bed seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding beds:', error);
        process.exit(1);
    }
};

seedBeds();
