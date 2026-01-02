const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');
const Prescription = require('./models/Prescription');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const fixMissingRecords = async () => {
    try {
        await connectDB();

        console.log('Finding completed appointments...');
        const completedAppointments = await Appointment.find({ status: 'Completed' });
        console.log(`Found ${completedAppointments.length} completed appointments.`);

        let recordsCreated = 0;
        let prescriptionsCreated = 0;

        for (const app of completedAppointments) {
            // Check if MedicalRecord exists
            const existingRecord = await MedicalRecord.findOne({ appointment: app._id });

            if (!existingRecord) {
                console.log(`Creating missing MedicalRecord for appointment ${app._id}...`);

                let prescriptionNotes = '';
                let prescriptionDiagnosis = 'Consultation';

                if (app.prescription) {
                    prescriptionNotes = app.prescription.notes || '';
                    prescriptionDiagnosis = app.prescription.diagnosis || 'Consultation';
                }

                const newRecord = await MedicalRecord.create({
                    patient: app.patient,
                    doctor: app.doctor,
                    appointment: app._id,
                    visitType: 'Consultation',
                    diagnosis: prescriptionDiagnosis,
                    notes: prescriptionNotes,
                    date: app.date,
                    status: 'Completed'
                });
                recordsCreated++;

                // Check if Prescription needs to be created
                if (app.prescription && app.prescription.medications && app.prescription.medications.length > 0) {
                    const existingPrescription = await Prescription.findOne({ record: newRecord._id });
                    if (!existingPrescription) {
                        console.log(`Creating missing Prescription for appointment ${app._id}...`);
                        await Prescription.create({
                            patient: app.patient,
                            doctor: app.doctor,
                            record: newRecord._id,
                            diagnosis: prescriptionDiagnosis,
                            medicines: app.prescription.medications.map(med => ({
                                name: med.name,
                                genericName: med.genericName || '',
                                dosage: med.dosage,
                                duration: med.duration,
                                instructions: med.instructions || ''
                            })),
                            notes: prescriptionNotes,
                            date: app.prescription.issuedAt || app.date,
                            isActive: true
                        });
                        prescriptionsCreated++;
                    }
                }
            }
        }

        console.log('-----------------------------------');
        console.log(`Fixed ${recordsCreated} missing medical records.`);
        console.log(`Fixed ${prescriptionsCreated} missing prescriptions.`);
        console.log('Done!');
        process.exit(0);

    } catch (error) {
        console.error('Error fixing records:', error);
        process.exit(1);
    }
};

fixMissingRecords();
