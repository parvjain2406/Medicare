const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Doctor = require('./models/Doctor');
const MedicalRecord = require('./models/MedicalRecord');
const Prescription = require('./models/Prescription');
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Indian doctors data
const doctorsData = [
    {
        name: 'Dr. Rajesh Gupta',
        specialization: 'Cardiologist',
        qualifications: 'MBBS, MD (Cardiology) - AIIMS Delhi',
        experience: 15,
        hospital: 'Apollo Hospital, Delhi',
        fees: 800,
        availability: {
            days: ['Mon', 'Wed', 'Fri'],
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM']
        },
        rating: 4.8,
        about: 'Dr. Rajesh Gupta is a renowned cardiologist with over 15 years of experience in treating complex cardiac conditions. He specializes in interventional cardiology and has performed over 5000 successful procedures.',
        image: ''
    },
    {
        name: 'Dr. Anjali Mehta',
        specialization: 'Neurologist',
        qualifications: 'MBBS, DM (Neurology) - NIMHANS Bangalore',
        experience: 12,
        hospital: 'Fortis Hospital, Mumbai',
        fees: 1000,
        availability: {
            days: ['Tue', 'Thu', 'Sat'],
            slots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '04:00 PM', '04:30 PM', '05:00 PM']
        },
        rating: 4.9,
        about: 'Dr. Anjali Mehta is an expert neurologist specializing in stroke management, epilepsy, and neurodegenerative disorders. She has been recognized for her research in brain-related ailments.',
        image: ''
    },
    {
        name: 'Dr. Vikram Singh',
        specialization: 'Orthopedic Surgeon',
        qualifications: 'MBBS, MS (Orthopedics), Fellowship in Joint Replacement - UK',
        experience: 18,
        hospital: 'Max Healthcare, Gurgaon',
        fees: 1200,
        availability: {
            days: ['Mon', 'Tue', 'Thu', 'Fri'],
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM', '02:30 PM', '03:00 PM']
        },
        rating: 4.7,
        about: 'Dr. Vikram Singh is a leading orthopedic surgeon with expertise in joint replacement surgeries and sports injuries. He has performed over 3000 successful joint replacement surgeries.',
        image: ''
    },
    {
        name: 'Dr. Priya Sharma',
        specialization: 'Dermatologist',
        qualifications: 'MBBS, MD (Dermatology) - PGI Chandigarh',
        experience: 10,
        hospital: 'AIIMS Delhi',
        fees: 600,
        availability: {
            days: ['Mon', 'Wed', 'Fri', 'Sat'],
            slots: ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
        },
        rating: 4.6,
        about: 'Dr. Priya Sharma specializes in cosmetic dermatology, acne treatment, and skin cancer diagnosis. She is known for her patient-centric approach and advanced treatment methods.',
        image: ''
    },
    {
        name: 'Dr. Amit Patel',
        specialization: 'General Physician',
        qualifications: 'MBBS, MD (Internal Medicine) - Grant Medical College, Mumbai',
        experience: 20,
        hospital: 'Medanta Hospital, Delhi',
        fees: 500,
        availability: {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '05:00 PM', '05:30 PM', '06:00 PM']
        },
        rating: 4.5,
        about: 'Dr. Amit Patel is an experienced general physician with expertise in managing chronic diseases like diabetes, hypertension, and thyroid disorders. He believes in holistic patient care.',
        image: ''
    },
    {
        name: 'Dr. Sunita Reddy',
        specialization: 'Gynecologist',
        qualifications: 'MBBS, MS (OB-GYN), DGO - Osmania Medical College',
        experience: 14,
        hospital: 'Apollo Hospital, Hyderabad',
        fees: 700,
        availability: {
            days: ['Tue', 'Wed', 'Thu', 'Sat'],
            slots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM']
        },
        rating: 4.8,
        about: 'Dr. Sunita Reddy is a senior gynecologist with expertise in high-risk pregnancies, infertility treatment, and minimally invasive surgeries.',
        image: ''
    },
    {
        name: 'Dr. Karthik Nair',
        specialization: 'Pediatrician',
        qualifications: 'MBBS, MD (Pediatrics) - CMC Vellore',
        experience: 11,
        hospital: 'Rainbow Children Hospital, Chennai',
        fees: 550,
        availability: {
            days: ['Mon', 'Wed', 'Fri', 'Sat'],
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM']
        },
        rating: 4.9,
        about: 'Dr. Karthik Nair is a compassionate pediatrician known for his excellent rapport with children. He specializes in neonatal care and childhood vaccinations.',
        image: ''
    }
];

// Seed function
const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await Doctor.deleteMany({});

        // Insert doctors
        console.log('Inserting doctors...');
        const insertedDoctors = await Doctor.insertMany(doctorsData);
        console.log(`✅ Inserted ${insertedDoctors.length} doctors`);

        // Find a test user to create sample records (if exists)
        const testUser = await User.findOne({});

        if (testUser) {
            console.log(`Found test user: ${testUser.name}`);

            // Clear existing records and prescriptions for this user
            await MedicalRecord.deleteMany({ patient: testUser._id });
            await Prescription.deleteMany({ patient: testUser._id });

            // Create sample medical records
            const sampleRecords = [
                {
                    patient: testUser._id,
                    doctor: insertedDoctors[4]._id, // Dr. Amit Patel
                    visitType: 'Consultation',
                    diagnosis: 'Viral Fever with Upper Respiratory Infection',
                    symptoms: ['Fever', 'Cough', 'Body ache', 'Fatigue'],
                    notes: 'Patient advised rest for 3 days. Follow up if fever persists.',
                    vitals: {
                        bloodPressure: '120/80 mmHg',
                        temperature: '101.2°F',
                        pulse: '88 bpm',
                        weight: '72 kg'
                    },
                    date: new Date('2024-11-12'),
                    status: 'Completed'
                },
                {
                    patient: testUser._id,
                    doctor: insertedDoctors[2]._id, // Dr. Vikram Singh
                    visitType: 'Lab Test',
                    diagnosis: 'MRI Scan - Knee (Right)',
                    symptoms: ['Knee pain', 'Swelling'],
                    notes: 'Mild ligament tear observed. Physiotherapy recommended.',
                    date: new Date('2024-12-20'),
                    status: 'Completed'
                },
                {
                    patient: testUser._id,
                    doctor: insertedDoctors[0]._id, // Dr. Rajesh Gupta
                    visitType: 'Routine Checkup',
                    diagnosis: 'Annual Heart Health Checkup',
                    symptoms: [],
                    notes: 'All cardiac parameters normal. ECG and Echo normal. Continue healthy lifestyle.',
                    vitals: {
                        bloodPressure: '118/76 mmHg',
                        temperature: '98.4°F',
                        pulse: '72 bpm',
                        weight: '71 kg'
                    },
                    date: new Date('2024-10-05'),
                    status: 'Completed'
                },
                {
                    patient: testUser._id,
                    doctor: insertedDoctors[3]._id, // Dr. Priya Sharma
                    visitType: 'Consultation',
                    diagnosis: 'Seasonal Allergic Dermatitis',
                    symptoms: ['Skin rash', 'Itching', 'Redness'],
                    notes: 'Prescribed antihistamines and topical cream. Avoid allergens.',
                    date: new Date('2024-09-15'),
                    status: 'Completed'
                }
            ];

            const insertedRecords = await MedicalRecord.insertMany(sampleRecords);
            console.log(`✅ Inserted ${insertedRecords.length} medical records`);

            // Create sample prescriptions with Indian medicines
            const samplePrescriptions = [
                {
                    patient: testUser._id,
                    doctor: insertedDoctors[4]._id, // Dr. Amit Patel
                    record: insertedRecords[0]._id,
                    diagnosis: 'Viral Fever with Upper Respiratory Infection',
                    medicines: [
                        {
                            name: 'Dolo 650',
                            genericName: 'Paracetamol 650mg',
                            dosage: '1-0-1 after food',
                            duration: '5 Days',
                            instructions: 'Take with warm water. Repeat every 6 hours if fever persists.'
                        },
                        {
                            name: 'Augmentin 625',
                            genericName: 'Amoxicillin + Clavulanic Acid',
                            dosage: '1-0-1 after food',
                            duration: '7 Days',
                            instructions: 'Complete the full course. Do not skip doses.'
                        },
                        {
                            name: 'Montair LC',
                            genericName: 'Montelukast + Levocetirizine',
                            dosage: '0-0-1',
                            duration: '10 Days',
                            instructions: 'Take at bedtime.'
                        },
                        {
                            name: 'Cofsils Lozenges',
                            genericName: 'Throat Lozenge',
                            dosage: 'As needed',
                            duration: '5 Days',
                            instructions: 'Dissolve in mouth for sore throat relief.'
                        }
                    ],
                    notes: 'Take plenty of fluids. Rest well. Avoid cold drinks.',
                    date: new Date('2024-11-12'),
                    validUntil: new Date('2024-11-19'),
                    isActive: false
                },
                {
                    patient: testUser._id,
                    doctor: insertedDoctors[2]._id, // Dr. Vikram Singh
                    record: insertedRecords[1]._id,
                    diagnosis: 'Mild Ligament Tear - Right Knee',
                    medicines: [
                        {
                            name: 'Zerodol SP',
                            genericName: 'Aceclofenac + Paracetamol + Serratiopeptidase',
                            dosage: '1-0-1 after food',
                            duration: '7 Days',
                            instructions: 'Do not take on empty stomach.'
                        },
                        {
                            name: 'Shelcal 500',
                            genericName: 'Calcium + Vitamin D3',
                            dosage: '0-1-0 after lunch',
                            duration: '30 Days',
                            instructions: 'For bone health support.'
                        },
                        {
                            name: 'Volini Gel',
                            genericName: 'Diclofenac Gel',
                            dosage: 'Apply twice daily',
                            duration: '14 Days',
                            instructions: 'Apply on affected area. Do not bandage tightly.'
                        }
                    ],
                    notes: 'Use knee support while walking. Start physiotherapy after 1 week.',
                    date: new Date('2024-12-20'),
                    validUntil: new Date('2025-01-20'),
                    isActive: true
                },
                {
                    patient: testUser._id,
                    doctor: insertedDoctors[3]._id, // Dr. Priya Sharma
                    record: insertedRecords[3]._id,
                    diagnosis: 'Seasonal Allergic Dermatitis',
                    medicines: [
                        {
                            name: 'Allegra 180',
                            genericName: 'Fexofenadine 180mg',
                            dosage: '0-0-1',
                            duration: '14 Days',
                            instructions: 'Take at night before sleep.'
                        },
                        {
                            name: 'Pan 40',
                            genericName: 'Pantoprazole 40mg',
                            dosage: '1-0-0 before food',
                            duration: '14 Days',
                            instructions: 'Take 30 mins before breakfast.'
                        },
                        {
                            name: 'Betnovate-C Cream',
                            genericName: 'Betamethasone + Clioquinol',
                            dosage: 'Apply twice daily',
                            duration: '7 Days',
                            instructions: 'Apply thin layer on affected area. Do not use on face.'
                        }
                    ],
                    notes: 'Avoid dust and pollen. Use mild soap.',
                    date: new Date('2024-09-15'),
                    validUntil: new Date('2024-09-29'),
                    isActive: false
                }
            ];

            const insertedPrescriptions = await Prescription.insertMany(samplePrescriptions);
            console.log(`✅ Inserted ${insertedPrescriptions.length} prescriptions`);
        } else {
            console.log('⚠️ No user found. Sample records and prescriptions not created.');
            console.log('   Register a user first, then run this script again.');
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('═'.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
