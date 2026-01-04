const mongoose = require('mongoose');
require('dotenv').config();
const UserSupplier = require('../models/UserSupplier');
const connectDB = require('../config/database');

const seedSupplier = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected successfully\n');

        // Delete existing supplier if exists (to avoid conflicts)
        // Check by username
        const existingSuppliers = await UserSupplier.deleteMany({
            username: 'supplier'
        });
        if (existingSuppliers.deletedCount > 0) {
            console.log(`Cleaned up ${existingSuppliers.deletedCount} existing supplier user(s)...\n`);
        } else {
            console.log('No existing supplier found to clean up...\n');
        }

        // Create new supplier
        console.log('Creating new supplier user...');
        const supplier = new UserSupplier({
            name: 'تأمین‌کننده تست',
            username: 'supplier',
            password: 'supplier123',
        });
        await supplier.save();
        console.log('✓ Supplier user created successfully');

        // Verify password
        const bcrypt = require('bcryptjs');
        const testPassword = 'supplier123';
        const isMatch = await bcrypt.compare(testPassword, supplier.password);

        console.log('\n✓ Supplier user ready:');
        console.log(`  Username: supplier`);
        console.log(`  Password: supplier123`);
        console.log(`  Password verified: ${isMatch ? '✓ YES' : '✗ NO'}`);

        if (!isMatch) {
            console.error('\n✗ ERROR: Password verification failed!');
            process.exit(1);
        }

        console.log('\n✓ You can now login with:');
        console.log('  Username: supplier');
        console.log('  Password: supplier123\n');

        process.exit(0);
    } catch (error) {
        console.error('Error creating supplier:', error);
        if (error.code === 11000) {
            console.error('\nDuplicate key error detected. Trying to find and update existing user...');
            try {
                // Try to find by username
                const existingSupplier = await UserSupplier.findOne({
                    username: 'supplier'
                });

                if (existingSupplier) {
                    // Update existing supplier
                    existingSupplier.name = 'تأمین‌کننده تست';
                    existingSupplier.username = 'supplier';
                    existingSupplier.password = 'supplier123'; // Will be hashed by pre-save hook
                    existingSupplier.isActive = true;
                    await existingSupplier.save();

                    // Verify password
                    const bcrypt = require('bcryptjs');
                    const testPassword = 'supplier123';
                    const isMatch = await bcrypt.compare(testPassword, existingSupplier.password);

                    console.log('✓ Existing supplier updated successfully');
                    console.log('\n✓ Supplier user ready:');
                    console.log(`  Username: supplier`);
                    console.log(`  Password: supplier123`);
                    console.log(`  Password verified: ${isMatch ? '✓ YES' : '✗ NO'}`);

                    if (!isMatch) {
                        console.error('\n✗ ERROR: Password verification failed!');
                        process.exit(1);
                    }

                    console.log('\n✓ You can now login with:');
                    console.log('  Username: supplier');
                    console.log('  Password: supplier123\n');
                } else {
                    console.error('Could not find existing supplier to update');
                    process.exit(1);
                }
                process.exit(0);
            } catch (updateError) {
                console.error('Update error:', updateError);
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    } finally {
        await mongoose.disconnect();
        console.log('Database disconnected.');
    }
};

seedSupplier();

