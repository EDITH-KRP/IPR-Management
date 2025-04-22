const { execSync } = require('child_process');
require('dotenv').config();

// Function to check if environment variables are set
function checkEnvVariables() {
  const requiredVars = ['ALCHEMY_SEPOLIA_URL', 'PRIVATE_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    return false;
  }
  
  return true;
}

// Function to deploy contracts
function deployContracts() {
  try {
    console.log('🚀 Starting deployment to Sepolia network...');
    
    // Compile contracts
    console.log('📝 Compiling contracts...');
    execSync('truffle compile', { stdio: 'inherit' });
    
    // Deploy to Sepolia
    console.log('🌐 Deploying to Sepolia...');
    execSync('truffle migrate --network sepolia --reset', { stdio: 'inherit' });
    
    console.log('✅ Deployment completed successfully!');
    
    // Verify contracts if ETHERSCAN_API_KEY is provided
    if (process.env.ETHERSCAN_API_KEY) {
      console.log('🔍 Verifying contracts on Etherscan...');
      // Add a delay to ensure contracts are processed by Etherscan
      setTimeout(() => {
        try {
          execSync('truffle run verify ContractIp Ipbidder IPRegistry --network sepolia', { stdio: 'inherit' });
          console.log('✅ Contract verification completed!');
        } catch (error) {
          console.error('❌ Contract verification failed:', error.message);
        }
      }, 30000); // 30 seconds delay
    } else {
      console.log('⚠️ ETHERSCAN_API_KEY not provided. Skipping contract verification.');
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Main function
function main() {
  console.log('🔍 Checking environment variables...');
  if (!checkEnvVariables()) {
    process.exit(1);
  }
  
  deployContracts();
}

// Run the script
main();const { execSync } = require('child_process');
require('dotenv').config();

// Function to check if environment variables are set
function checkEnvVariables() {
  const requiredVars = ['ALCHEMY_SEPOLIA_URL', 'PRIVATE_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    return false;
  }
  
  return true;
}

// Function to deploy contracts
function deployContracts() {
  try {
    console.log('🚀 Starting deployment to Sepolia network...');
    
    // Compile contracts
    console.log('📝 Compiling contracts...');
    execSync('truffle compile', { stdio: 'inherit' });
    
    // Deploy to Sepolia
    console.log('🌐 Deploying to Sepolia...');
    execSync('truffle migrate --network sepolia --reset', { stdio: 'inherit' });
    
    console.log('✅ Deployment completed successfully!');
    
    // Verify contracts if ETHERSCAN_API_KEY is provided
    if (process.env.ETHERSCAN_API_KEY) {
      console.log('🔍 Verifying contracts on Etherscan...');
      // Add a delay to ensure contracts are processed by Etherscan
      setTimeout(() => {
        try {
          execSync('truffle run verify ContractIp Ipbidder IPRegistry --network sepolia', { stdio: 'inherit' });
          console.log('✅ Contract verification completed!');
        } catch (error) {
          console.error('❌ Contract verification failed:', error.message);
        }
      }, 30000); // 30 seconds delay
    } else {
      console.log('⚠️ ETHERSCAN_API_KEY not provided. Skipping contract verification.');
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Main function
function main() {
  console.log('🔍 Checking environment variables...');
  if (!checkEnvVariables()) {
    process.exit(1);
  }
  
  deployContracts();
}

// Run the script
main();