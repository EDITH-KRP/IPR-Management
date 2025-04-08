require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: '0.8.1',
  defaultNetwork: "ganache", // Set Ganache as the default network
  networks: {
    hardhat: {},
    ganache: { // Updated to use Ganache
      url: "http://127.0.0.1:7545", // Ganache runs on port 7545 by default
      accounts: {
        mnemonic: process.env.MNEMONIC, // Use your mnemonic for accounts
      },
    },
  },
};
