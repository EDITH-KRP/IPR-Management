// Script to update the .env file with the deployed contract address
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Function to update the .env file with the new contract address
function updateEnvFile(contractAddress) {
    const envPath = path.resolve(__dirname, '../backend/.env');
    
    // Read the current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the CONTRACT_ADDRESS line
    if (envContent.includes('CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(
            /CONTRACT_ADDRESS=.*/,
            `CONTRACT_ADDRESS=${contractAddress}`
        );
    } else {
        // If CONTRACT_ADDRESS doesn't exist, add it
        envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    }
    
    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log(`Updated .env file with contract address: ${contractAddress}`);
}

// Export the function to be used in deployment scripts
module.exports = {
    updateEnvFile
};

// If this script is run directly, it can take the contract address as an argument
if (require.main === module) {
    const contractAddress = process.argv[2];
    if (!contractAddress) {
        console.error('Please provide a contract address as an argument');
        process.exit(1);
    }
    
    updateEnvFile(contractAddress);
}