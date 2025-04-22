const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

console.log("MNEMONIC:", process.env.MNEMONIC ? "Loaded" : "Not Loaded");
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Loaded" : "Not Loaded");
console.log("ALCHEMY_SEPOLIA_URL:", process.env.ALCHEMY_SEPOLIA_URL ? "Loaded" : "Not Loaded");

module.exports = {
  networks: {
    // For local development
    development: {
      host: "127.0.0.1",
      port: 7545, // Default Ganache port
      network_id: "*", // Match any network id
    },
    // Sepolia testnet configuration with Alchemy
    sepolia: {
      provider: () => new HDWalletProvider({
        privateKeys: [process.env.PRIVATE_KEY],
        providerOrUrl: process.env.ALCHEMY_SEPOLIA_URL,
        numberOfAddresses: 1
      }),
      network_id: 11155111, // Sepolia's network id
      gas: 5500000,
      gasPrice: 20000000000, // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.1", // Match the version used in your contracts
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  // Plugins if you're using any
  plugins: [
    'truffle-plugin-verify'
  ]
};
