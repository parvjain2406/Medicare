const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Doctor model
const Doctor = require('./models/Doctor');

/**
 * Generate email from doctor name
 * e.g., "Dr. Rajesh Gupta" -> "rajesh.gupta@medicare.ac.in"
 */
const generateEmail = (name) => {
    // Remove "Dr." prefix and clean up
    const cleanName = name
        .replace(/^Dr\.\s*/i, '')
        .trim()
        .toLowerCase();

    // Split into parts and join with dot
    const parts = cleanName.split(/\s+/);
    const emailBase = parts.join('.');

    return `${emailBase}@medicare.ac.in`;
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for migration...');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

/**
 * Migrate doctors - add email and password
 */
const migrateDoctors = async () => {
    try {
        await connectDB();

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║         MediCare Doctor Migration Script             ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

        // Get all doctors
        const doctors = await Doctor.find({});
        console.log(`Found ${doctors.length} doctors to migrate.\n`);

        // Default password
        const defaultPassword = '123456';

        // Hash the default password once
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const doctor of doctors) {
            // Skip if doctor already has email and password
            if (doctor.email && doctor.password) {
                console.log(`⏭️  Skipping ${doctor.name} - already has credentials`);
                skippedCount++;
                continue;
            }

            // Generate email from name
            const email = generateEmail(doctor.name);

            // Update doctor with email and password
            await Doctor.updateOne(
                { _id: doctor._id },
                {
                    $set: {
                        email: email,
                        password: hashedPassword
                    }
                }
            );

            console.log(`✅ Migrated: ${doctor.name}`);
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${defaultPassword} (hashed)\n`);
            migratedCount++;
        }

        console.log('═'.repeat(50));
        console.log(`\n✅ Migration Complete!`);
        console.log(`   - Migrated: ${migratedCount} doctors`);
        console.log(`   - Skipped: ${skippedCount} doctors`);
        console.log(`\n📋 Doctor Credentials Summary:\n`);

        // List all doctor credentials
        const updatedDoctors = await Doctor.find({}).select('name email');
        updatedDoctors.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.name}`);
            console.log(`   Email: ${doc.email}`);
            console.log(`   Password: ${defaultPassword}\n`);
        });

        console.log('═'.repeat(50));
        console.log('\n⚠️  IMPORTANT: Doctors should change their password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

// Run migration
migrateDoctors();
