const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'ENV_SETUP.md');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Default environment variables
const defaultEnv = {
    MONGODB_URI: 'mongodb://localhost:27017/hotline',
    PORT: '3000',
    JWT_SECRET: jwtSecret,
    NODE_ENV: 'development',
    RATE_LIMIT_WINDOW_MS: '900000',
    RATE_LIMIT_MAX_REQUESTS: '100'
};

// Check if .env exists
if (fs.existsSync(envPath)) {
    console.log('✓ .env file already exists');
    
    // Read existing .env
    const existingContent = fs.readFileSync(envPath, 'utf8');
    const lines = existingContent.split('\n');
    const existingVars = {};
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                existingVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    
    // Check if JWT_SECRET is missing or is the default
    if (!existingVars.JWT_SECRET || existingVars.JWT_SECRET.includes('your-secret-key') || existingVars.JWT_SECRET.includes('change-this')) {
        console.log('⚠ JWT_SECRET is missing or using default value');
        console.log('  Generated new JWT_SECRET:', jwtSecret);
        console.log('  Please update your .env file with the new JWT_SECRET');
    } else {
        console.log('✓ JWT_SECRET is already set');
    }
} else {
    // Create new .env file
    console.log('Creating new .env file...');
    let envContent = '# Environment Variables\n';
    envContent += '# Generated automatically - DO NOT commit this file\n\n';
    
    Object.entries(defaultEnv).forEach(([key, value]) => {
        envContent += `${key}=${value}\n`;
    });
    
    fs.writeFileSync(envPath, envContent);
    console.log('✓ .env file created successfully');
    console.log('✓ JWT_SECRET generated:', jwtSecret);
}

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✓ logs directory created');
} else {
    console.log('✓ logs directory already exists');
}

console.log('\n✓ Setup complete!');
console.log('\nNext steps:');
console.log('1. Review and update .env file if needed');
console.log('2. Make sure MongoDB is running');
console.log('3. Run: npm start');


