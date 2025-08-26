import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up environment configuration...\n');

try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    const envSamplePath = path.join(__dirname, 'env.sample');
    
    if (fs.existsSync(envPath)) {
        console.log('✅ .env file already exists');
        console.log('📁 Location:', envPath);
        console.log('\n💡 To modify environment variables, edit the .env file');
    } else {
        // Check if env.sample exists
        if (fs.existsSync(envSamplePath)) {
            // Copy env.sample to .env
            const envSampleContent = fs.readFileSync(envSamplePath, 'utf8');
            fs.writeFileSync(envPath, envSampleContent);
            
            console.log('✅ .env file created successfully from env.sample');
            console.log('📁 Location:', envPath);
            console.log('\n⚠️  IMPORTANT: Please update the JWT_SECRET in your .env file');
            console.log('   The current value is just a placeholder and should be changed');
            console.log('\n💡 You can now customize your environment variables');
        } else {
            console.log('❌ env.sample file not found');
            console.log('📁 Expected location:', envSamplePath);
        }
    }
    
    console.log('\n📋 Environment variables to configure:');
    console.log('   MONGODB_URI - MongoDB connection string');
    console.log('   JWT_SECRET - Secret key for JWT tokens');
    console.log('   PORT - Server port (default: 3000)');
    console.log('   NODE_ENV - Environment (development/production)');
    
} catch (error) {
    console.error('❌ Error setting up environment:', error.message);
} 