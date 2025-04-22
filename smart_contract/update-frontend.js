const fs = require('fs');
const path = require('path');

// Function to read the deployed contract address
async function getDeployedAddress() {
  try {
    // Read the deployment artifacts
    const contractIpPath = path.resolve(__dirname, 'build/contracts/ContractIp.json');
    const contractIpData = JSON.parse(fs.readFileSync(contractIpPath, 'utf8'));
    
    // Get the network ID from the most recent deployment
    const networkIds = Object.keys(contractIpData.networks);
    const latestNetworkId = networkIds[networkIds.length - 1];
    
    if (!latestNetworkId) {
      throw new Error('No deployment found in ContractIp.json');
    }
    
    // Get the contract address
    const contractAddress = contractIpData.networks[latestNetworkId].address;
    
    if (!contractAddress) {
      throw new Error('Contract address not found in deployment data');
    }
    
    return contractAddress;
  } catch (error) {
    console.error('Error reading deployed address:', error.message);
    throw error;
  }
}

// Function to update the frontend constants file
async function updateFrontendConstants(contractAddress) {
  try {
    const constantsPath = path.resolve(__dirname, '../user-ui/src/utils/constants.js');
    
    // Read the current constants file
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Update the contract address
    const addressRegex = /export const contractAddress = ['"]([^'"]+)['"]/;
    const newAddressLine = `export const contractAddress = '${contractAddress}'`;
    
    if (addressRegex.test(constantsContent)) {
      // Replace the existing address
      constantsContent = constantsContent.replace(addressRegex, newAddressLine);
    } else {
      console.error('Could not find contractAddress export in constants.js');
      return false;
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(constantsPath, constantsContent);
    
    console.log(`✅ Updated frontend contract address to: ${contractAddress}`);
    return true;
  } catch (error) {
    console.error('Error updating frontend constants:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🔍 Reading deployed contract address...');
    const contractAddress = await getDeployedAddress();
    
    console.log(`📝 Found contract address: ${contractAddress}`);
    console.log('🔄 Updating frontend constants...');
    
    const success = await updateFrontendConstants(contractAddress);
    
    if (success) {
      console.log('✅ Frontend updated successfully!');
    } else {
      console.error('❌ Failed to update frontend');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
main();const fs = require('fs');
const path = require('path');

// Function to read the deployed contract address
async function getDeployedAddress() {
  try {
    // Read the deployment artifacts
    const contractIpPath = path.resolve(__dirname, 'build/contracts/ContractIp.json');
    const contractIpData = JSON.parse(fs.readFileSync(contractIpPath, 'utf8'));
    
    // Get the network ID from the most recent deployment
    const networkIds = Object.keys(contractIpData.networks);
    const latestNetworkId = networkIds[networkIds.length - 1];
    
    if (!latestNetworkId) {
      throw new Error('No deployment found in ContractIp.json');
    }
    
    // Get the contract address
    const contractAddress = contractIpData.networks[latestNetworkId].address;
    
    if (!contractAddress) {
      throw new Error('Contract address not found in deployment data');
    }
    
    return contractAddress;
  } catch (error) {
    console.error('Error reading deployed address:', error.message);
    throw error;
  }
}

// Function to update the frontend constants file
async function updateFrontendConstants(contractAddress) {
  try {
    const constantsPath = path.resolve(__dirname, '../user-ui/src/utils/constants.js');
    
    // Read the current constants file
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Update the contract address
    const addressRegex = /export const contractAddress = ['"]([^'"]+)['"]/;
    const newAddressLine = `export const contractAddress = '${contractAddress}'`;
    
    if (addressRegex.test(constantsContent)) {
      // Replace the existing address
      constantsContent = constantsContent.replace(addressRegex, newAddressLine);
    } else {
      console.error('Could not find contractAddress export in constants.js');
      return false;
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(constantsPath, constantsContent);
    
    console.log(`✅ Updated frontend contract address to: ${contractAddress}`);
    return true;
  } catch (error) {
    console.error('Error updating frontend constants:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('🔍 Reading deployed contract address...');
    const contractAddress = await getDeployedAddress();
    
    console.log(`📝 Found contract address: ${contractAddress}`);
    console.log('🔄 Updating frontend constants...');
    
    const success = await updateFrontendConstants(contractAddress);
    
    if (success) {
      console.log('✅ Frontend updated successfully!');
    } else {
      console.error('❌ Failed to update frontend');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
main();