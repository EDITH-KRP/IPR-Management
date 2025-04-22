# Deployment Guide for IPR-Management

This guide will walk you through the process of deploying the IPR-Management project to the Sepolia testnet.

## Prerequisites

Before you begin, make sure you have the following:

1. Node.js and npm installed
2. An Alchemy account with an API key for the Sepolia network
3. A Pinata account with API keys for IPFS storage
4. MetaMask wallet with some Sepolia ETH (get from a faucet)
5. Your MetaMask private key or mnemonic phrase

## Step 1: Set Up Environment Variables

### Smart Contract Environment Variables

Create or update the `.env` file in the `smart_contract` directory:

```
# Alchemy API URL for Sepolia network
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Your Ethereum wallet private key (from MetaMask or other wallet)
PRIVATE_KEY=YOUR_PRIVATE_KEY

# Your wallet mnemonic phrase (12 or 24 words) - optional if using private key
MNEMONIC="your mnemonic phrase here"

# Gas price in gwei (optional, defaults to network gas price)
GAS_PRICE=20

# Gas limit for transactions (optional)
GAS_LIMIT=5500000

# Etherscan API Key for contract verification (optional)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

### Frontend Environment Variables

Create or update the `.env` file in the `user-ui` directory:

```
# Alchemy API key for frontend
REACT_APP_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY

# Pinata API credentials for IPFS storage
REACT_APP_PINATA_KEY=YOUR_PINATA_KEY
REACT_APP_PINATA_SECRET=YOUR_PINATA_SECRET

# Admin wallet address (uncomment if needed)
# REACT_APP_ADMIN_ADDRESS=YOUR_ADMIN_WALLET_ADDRESS
```

## Step 2: Install Dependencies

Install dependencies for both the smart contract and frontend:

```bash
# Install smart contract dependencies
cd smart_contract
npm install

# Install frontend dependencies
cd ../user-ui
npm install
```

## Step 3: Deploy Smart Contracts

Deploy the smart contracts to the Sepolia testnet:

```bash
cd smart_contract
node deploy.js
```

This script will:
1. Compile the contracts
2. Deploy them to Sepolia
3. Verify them on Etherscan (if ETHERSCAN_API_KEY is provided)

## Step 4: Update Frontend with Deployed Contract Address

After deployment, update the frontend with the new contract address:

```bash
cd smart_contract
node update-frontend.js
```

This script will automatically update the contract address in the frontend constants file.

## Step 5: Build and Deploy the Frontend

Build the frontend for production:

```bash
cd user-ui
npm run build
```

The build output will be in the `build` directory, which you can deploy to any static hosting service like:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Firebase Hosting

### Example: Deploy to Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Deploy: `netlify deploy --prod --dir=build`

## Step 6: Test the Deployed Application

1. Open your deployed frontend application
2. Connect your MetaMask wallet (make sure it's on the Sepolia network)
3. Test the functionality to ensure everything is working correctly

## Troubleshooting

### Contract Deployment Issues

- Make sure your wallet has enough Sepolia ETH
- Check that your private key or mnemonic is correct
- Verify that the Alchemy API URL is correct

### Frontend Connection Issues

- Ensure MetaMask is connected to the Sepolia network
- Check that the contract address in the frontend is correct
- Verify that your Alchemy API key is valid

### IPFS Storage Issues

- Confirm that your Pinata API keys are correct
- Check the Pinata dashboard to see if uploads are successful

## Maintenance

After deployment, you may need to:

1. Update contracts and redeploy if changes are made
2. Update the frontend to use new contract addresses
3. Monitor gas costs and adjust as needed

## Security Considerations

- Never commit your private keys or API keys to version control
- Use environment variables for sensitive information
- Consider using a hardware wallet for production deployments# Deployment Guide for IPR-Management

This guide will walk you through the process of deploying the IPR-Management project to the Sepolia testnet.

## Prerequisites

Before you begin, make sure you have the following:

1. Node.js and npm installed
2. An Alchemy account with an API key for the Sepolia network
3. A Pinata account with API keys for IPFS storage
4. MetaMask wallet with some Sepolia ETH (get from a faucet)
5. Your MetaMask private key or mnemonic phrase

## Step 1: Set Up Environment Variables

### Smart Contract Environment Variables

Create or update the `.env` file in the `smart_contract` directory:

```
# Alchemy API URL for Sepolia network
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Your Ethereum wallet private key (from MetaMask or other wallet)
PRIVATE_KEY=YOUR_PRIVATE_KEY

# Your wallet mnemonic phrase (12 or 24 words) - optional if using private key
MNEMONIC="your mnemonic phrase here"

# Gas price in gwei (optional, defaults to network gas price)
GAS_PRICE=20

# Gas limit for transactions (optional)
GAS_LIMIT=5500000

# Etherscan API Key for contract verification (optional)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

### Frontend Environment Variables

Create or update the `.env` file in the `user-ui` directory:

```
# Alchemy API key for frontend
REACT_APP_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY

# Pinata API credentials for IPFS storage
REACT_APP_PINATA_KEY=YOUR_PINATA_KEY
REACT_APP_PINATA_SECRET=YOUR_PINATA_SECRET

# Admin wallet address (uncomment if needed)
# REACT_APP_ADMIN_ADDRESS=YOUR_ADMIN_WALLET_ADDRESS
```

## Step 2: Install Dependencies

Install dependencies for both the smart contract and frontend:

```bash
# Install smart contract dependencies
cd smart_contract
npm install

# Install frontend dependencies
cd ../user-ui
npm install
```

## Step 3: Deploy Smart Contracts

Deploy the smart contracts to the Sepolia testnet:

```bash
cd smart_contract
node deploy.js
```

This script will:
1. Compile the contracts
2. Deploy them to Sepolia
3. Verify them on Etherscan (if ETHERSCAN_API_KEY is provided)

## Step 4: Update Frontend with Deployed Contract Address

After deployment, update the frontend with the new contract address:

```bash
cd smart_contract
node update-frontend.js
```

This script will automatically update the contract address in the frontend constants file.

## Step 5: Build and Deploy the Frontend

Build the frontend for production:

```bash
cd user-ui
npm run build
```

The build output will be in the `build` directory, which you can deploy to any static hosting service like:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Firebase Hosting

### Example: Deploy to Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Deploy: `netlify deploy --prod --dir=build`

## Step 6: Test the Deployed Application

1. Open your deployed frontend application
2. Connect your MetaMask wallet (make sure it's on the Sepolia network)
3. Test the functionality to ensure everything is working correctly

## Troubleshooting

### Contract Deployment Issues

- Make sure your wallet has enough Sepolia ETH
- Check that your private key or mnemonic is correct
- Verify that the Alchemy API URL is correct

### Frontend Connection Issues

- Ensure MetaMask is connected to the Sepolia network
- Check that the contract address in the frontend is correct
- Verify that your Alchemy API key is valid

### IPFS Storage Issues

- Confirm that your Pinata API keys are correct
- Check the Pinata dashboard to see if uploads are successful

## Maintenance

After deployment, you may need to:

1. Update contracts and redeploy if changes are made
2. Update the frontend to use new contract addresses
3. Monitor gas costs and adjust as needed

## Security Considerations

- Never commit your private keys or API keys to version control
- Use environment variables for sensitive information
- Consider using a hardware wallet for production deployments