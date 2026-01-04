const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotline';
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(mongoURI);
        console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✓ Database: ${conn.connection.name}`);
    } catch (error) {
        console.error('✗ Error connecting to MongoDB:', error.message);
        console.error('Please make sure MongoDB is running and the connection string is correct.');
        process.exit(1);
    }
};

module.exports = connectDB;

