const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

console.log("🔹 MNEMONIC:", process.env.MNEMONIC ? "Loaded ✅" : "Not Loaded ❌");
console.log("🔹 INFURA_PROJECT_ID:", process.env.INFURA_PROJECT_ID);

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC, 
        `https://sepolia.infura.io/v3/580dd71b87fb4ad68684466217017729` // Your Infura ID
      ),
      network_id: 11155111, 
      gas: 5500000, 
      confirmations: 2, 
      timeoutBlocks: 200, 
      skipDryRun: true,
    }    
  },
  compilers: {
    solc: {
      version: "0.8.20",
    }
  }
};
