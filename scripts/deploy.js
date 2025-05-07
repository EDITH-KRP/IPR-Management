// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function updateEnvFile(contractAddress) {
  const envPath = path.resolve(__dirname, "../backend/.env");
  
  // Read the current .env file
  let envContent = fs.readFileSync(envPath, "utf8");
  
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
  
  console.log(`Updated backend/.env file with contract address: ${contractAddress}`);
  
  // Also copy the ABI to the backend folder
  const buildPath = path.resolve(__dirname, "../artifacts/contracts/IPNFT.sol/IPNFT.json");
  const abiPath = path.resolve(__dirname, "../backend/abi/IPNFT.json");
  
  if (fs.existsSync(buildPath)) {
    const contractJson = JSON.parse(fs.readFileSync(buildPath, "utf8"));
    fs.writeFileSync(abiPath, JSON.stringify(contractJson.abi, null, 2));
    console.log("Updated ABI file in backend/abi folder");
  } else {
    console.warn("Could not find contract build file to update ABI");
  }
}

async function main() {
  // Deploy the IPNFT contract
  console.log("Deploying IPNFT contract...");
  const ipnft = await hre.ethers.deployContract("IPNFT");
  await ipnft.waitForDeployment();

  const contractAddress = await ipnft.getAddress();
  console.log(`IPNFT deployed to ${contractAddress}`);
  
  // Update the .env file with the contract address
  await updateEnvFile(contractAddress);
  
  console.log("Deployment completed successfully!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});