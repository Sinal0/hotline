const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const UserSupplier = require('../models/UserSupplier');
const connectDB = require('../config/database');

const migrateSuppliers = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected successfully\n');

        // Find all users with role 'supplier'
        console.log('Finding all suppliers in users collection...');
        const suppliers = await User.find({ role: 'supplier' });
        console.log(`Found ${suppliers.length} suppliers to migrate\n`);

        if (suppliers.length === 0) {
            console.log('No suppliers found. Migration complete.');
            process.exit(0);
        }

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const supplier of suppliers) {
            try {
                // Check if supplier already exists in user-suppliers collection
                const existingSupplier = await UserSupplier.findOne({
                    $or: [
                        { username: supplier.username },
                        { _id: supplier._id }
                    ]
                });

                if (existingSupplier) {
                    console.log(`⚠ Skipping supplier ${supplier.name} (${supplier.username}) - already exists in user-suppliers`);
                    skippedCount++;
                    continue;
                }

                // Create new supplier in user-suppliers collection
                // Note: We don't preserve _id to avoid conflicts, MongoDB will generate a new one
                const newSupplier = new UserSupplier({
                    name: supplier.name,
                    username: supplier.username || `supplier_${supplier._id}`,
                    password: supplier.password, // Keep the same hashed password
                    companyName: supplier.companyName || '',
                    businessAddress: supplier.businessAddress || '',
                    isActive: true,
                    createdAt: supplier.createdAt,
                    updatedAt: supplier.updatedAt,
                });

                await newSupplier.save();
                console.log(`✓ Migrated supplier: ${supplier.name} (${supplier.username})`);
                migratedCount++;

            } catch (error) {
                console.error(`✗ Error migrating supplier ${supplier.name} (${supplier.username}):`, error.message);
                errorCount++;
            }
        }

        console.log('\n=== Migration Summary ===');
        console.log(`Total suppliers found: ${suppliers.length}`);
        console.log(`Successfully migrated: ${migratedCount}`);
        console.log(`Skipped (already exists): ${skippedCount}`);
        console.log(`Errors: ${errorCount}`);

        if (migratedCount > 0) {
            console.log('\nRemoving migrated suppliers from users collection...');
            // Remove migrated suppliers from users collection
            for (const supplier of suppliers) {
                try {
                    const existingSupplier = await UserSupplier.findOne({
                        username: supplier.username
                    });
                    if (existingSupplier) {
                        await User.findByIdAndDelete(supplier._id);
                        console.log(`✓ Removed supplier ${supplier.name} from users collection`);
                    }
                } catch (error) {
                    console.error(`✗ Error removing supplier ${supplier.name}:`, error.message);
                }
            }
            console.log('\n✓ Migration completed successfully!');
            console.log('Suppliers have been moved to user-suppliers collection.');
        } else {
            console.log('\n⚠ No new suppliers were migrated.');
        }

        await mongoose.disconnect();
        console.log('Database disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
};

migrateSuppliers();

