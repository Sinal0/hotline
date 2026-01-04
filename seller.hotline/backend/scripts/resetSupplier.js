const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/database');
const bcrypt = require('bcryptjs');

const resetSupplier = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected successfully\n');

        // Delete existing supplier if exists (to avoid conflicts)
        await User.deleteMany({ username: 'supplier', role: 'supplier' });
        console.log('Cleaned up any existing supplier users...\n');
        
        // Create new supplier
        console.log('Creating new supplier user...');
        const supplier = new User({
            name: 'تأمین‌کننده تست',
            username: 'supplier',
            email: 'supplier@hotline.com',
            phone: '09123456789',
            password: 'supplier123',
            role: 'supplier',
        });
        await supplier.save();
        console.log('✓ Supplier user created successfully');

        // Verify password
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
        console.error('Error resetting supplier:', error);
        if (error.code === 11000) {
            console.error('\nDuplicate key error. Trying to update existing user...');
            try {
                await User.findOneAndUpdate(
                    { username: 'supplier' },
                    { 
                        password: 'supplier123',
                        role: 'supplier',
                        name: 'تأمین‌کننده تست',
                        email: 'supplier@hotline.com',
                        phone: '09123456789'
                    },
                    { new: true }
                );
                console.log('✓ User updated successfully');
                process.exit(0);
            } catch (updateError) {
                console.error('Update error:', updateError);
                process.exit(1);
            }
        } else {
            process.exit(1);
        }
    }
};

resetSupplier();

