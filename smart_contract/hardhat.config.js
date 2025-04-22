require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: '0.8.1',
  defaultNetwork: "sepolia", // Set Sepolia as the default network
  networks: {
    hardhat: {},
    ganache: { // Keep Ganache for local development
      url: "http://127.0.0.1:7545", // Ganache runs on port 7545 by default
      accounts: {
        mnemonic: process.env.MNEMONIC, // Use your mnemonic for accounts
      },
    },
    sepolia: { // Add Sepolia network with Alchemy
      url: process.env.ALCHEMY_SEPOLIA_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
};
