/**
 * Script to fix database indexes
 * Run this if you're having duplicate key errors
 * 
 * Usage: node fixIndexes.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const fixIndexes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;

        // Get the users collection
        const usersCollection = db.collection('users');

        // List all indexes
        console.log('\nCurrent indexes:');
        const indexes = await usersCollection.indexes();
        console.log(JSON.stringify(indexes, null, 2));

        // Drop the mobile_1 index if it exists (this is the problematic unique index)
        try {
            await usersCollection.dropIndex('mobile_1');
            console.log('\n✓ Dropped problematic mobile_1 index');
        } catch (e) {
            console.log('\nNo mobile_1 index to drop (this is fine)');
        }

        // Also try dropping any other mobile indexes
        for (const index of indexes) {
            if (index.key && index.key.mobile !== undefined && index.name !== '_id_') {
                try {
                    await usersCollection.dropIndex(index.name);
                    console.log(`✓ Dropped index: ${index.name}`);
                } catch (e) {
                    console.log(`Could not drop ${index.name}: ${e.message}`);
                }
            }
        }

        // Optionally clear all users (uncomment if you want to start fresh)
        // await usersCollection.deleteMany({});
        // console.log('\n✓ Cleared all users');

        console.log('\n✓ Index fix complete! Restart your server now.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixIndexes();
