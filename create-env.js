// ====================================================
// CREATE .ENV FILE HELPER SCRIPT
// ====================================================
// Run this script to create .env file interactively
// Usage: node create-env.js
// ====================================================

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createEnvFile() {
    console.log('📝 Creating .env file for backend...\n');
    
    const envPath = path.join(__dirname, '.env');
    
    // Check if .env already exists
    if (fs.existsSync(envPath)) {
        const overwrite = await question('.env file already exists. Overwrite? (y/n): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('❌ Cancelled. .env file not changed.');
            rl.close();
            return;
        }
    }

    // Collect environment variables
    const dbHost = await question('Database Host [localhost]: ') || 'localhost';
    const dbPort = await question('Database Port [5432]: ') || '5432';
    const dbName = await question('Database Name [fake_news_db]: ') || 'fake_news_db';
    const dbUser = await question('Database User [postgres]: ') || 'postgres';
    const dbPassword = await question('Database Password [root]: ') || 'root';
    const port = await question('Backend Port [3001]: ') || '3001';
    const aiServiceUrl = await question('AI Service URL [http://localhost:5000]: ') || 'http://localhost:5000';
    const frontendUrl = await question('Frontend URL [http://localhost:5173]: ') || 'http://localhost:5173';

    // Create .env content
    const envContent = `# ====================================================
# BACKEND ENVIRONMENT CONFIGURATION
# ====================================================
# Generated automatically - do not commit to git
# ====================================================

# Database Configuration
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# Server Configuration
PORT=${port}
NODE_ENV=development

# AI Service URL
AI_SERVICE_URL=${aiServiceUrl}

# Frontend URL (for CORS)
FRONTEND_URL=${frontendUrl}
`;

    // Write .env file
    try {
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ .env file created successfully!');
        console.log(`📁 Location: ${envPath}`);
        console.log('\n⚠️  Remember to add .env to .gitignore!');
    } catch (error) {
        console.error('\n❌ Error creating .env file:', error.message);
    }

    rl.close();
}

createEnvFile();

