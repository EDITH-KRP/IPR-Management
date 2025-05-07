# Patent Registry Blockchain Platform

A decentralized application for registering, managing, and trading patents using blockchain technology.

## Overview

The Patent Registry DApp allows users to:

- Register patents on the blockchain
- View and manage their patent portfolio
- List patents for sale in the marketplace
- Place bids on patents
- Accept bids from potential buyers
- Extend patent durations
- Search for patents by various criteria

## Features

- **Blockchain-Based Ownership**: Secure and verifiable patent ownership
- **Decentralized Marketplace**: Trade patents directly with other users
- **Time-Limited Protection**: Patents have expiration dates that can be extended
- **Transparent History**: All transactions are recorded on the blockchain
- **Admin Verification**: Optional verification process for patent authenticity
- **Dark/Light Theme**: User-friendly interface with theme toggle
- **Responsive Design**: Works on all device sizes
- **IPFS Storage**: Patent metadata is stored permanently on IPFS

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Flask (Python)
- **Blockchain**: Ethereum (Solidity smart contracts)
- **Web3 Integration**: Web3.js, Web3.py
- **IPFS Storage**: Filebase
- **Testing**: Pytest, Unittest

## Getting Started

### Prerequisites

- Python 3.8 or higher
- MetaMask or another Ethereum wallet browser extension
- Access to an Ethereum network (Sepolia testnet recommended for testing)

### Running the Application

#### Option 1: Using the Batch File (Recommended)

1. Double-click the `run_project.bat` file in the root directory
2. The application will start and be available at http://localhost:5000
3. Open your browser and navigate to this address

#### Option 2: Creating a Desktop Shortcut

1. Run the `create_shortcut.bat` file to create a desktop shortcut
2. Double-click the "Patent Registry DApp" shortcut on your desktop
3. The application will start and open in your default browser

#### Option 3: Manual Start

1. Open a command prompt or terminal
2. Navigate to the backend directory:
   ```
   cd d:\IPR-Manager\backend
   ```
3. Run the Flask application:
   ```
   python app_fixed.py
   ```
4. Open your browser and navigate to http://localhost:5000

### Installation (For Development)

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/IPR-Manager.git
   cd IPR-Manager
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   Create a `.env` file based on `.env.example` with your credentials.

4. Deploy the smart contracts (if not already deployed):
   ```
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   Update the contract addresses in your `.env` file.

5. Start the Flask server:
   ```
   python -m backend.app_fixed
   ```

6. Access the application at `http://localhost:5000`

## Using the Application

1. **Connect Your Wallet**:
   - Click the "Connect" button in the top-right corner
   - Approve the connection in your MetaMask wallet

2. **Register a Patent**:
   - Navigate to the "Register Patent" page
   - Fill in the patent details
   - Submit the form and confirm the transaction in your wallet

3. **View Your Patents**:
   - Go to the "Dashboard" page to see all your patents
   - Manage your patents (list for sale, extend duration, etc.)

4. **Browse the Marketplace**:
   - Visit the "Marketplace" page to see patents for sale
   - Place bids on patents you're interested in

5. **Manage Bids**:
   - Check the "View Bids" section on your patent details page
   - Accept bids to transfer ownership

## Smart Contracts

The platform uses two main smart contracts:

1. **PatentRegistry**: Handles patent registration, ownership, and metadata
   - ERC721 standard for NFT functionality
   - Time-limited ownership with expiration dates
   - Metadata URI storage for IPFS integration

2. **PatentMarketplace**: Manages listing patents for sale, bidding, and transfers
   - Listing functionality for patents
   - Bidding system for potential buyers
   - Secure ownership transfer

## Project Structure

- `/frontend` - Frontend templates and static files
  - `/templates` - HTML templates
  - `/static` - CSS, JavaScript, and images
- `/backend` - Backend Python modules
  - `app_fixed.py` - Main Flask application
  - `web3_connection.py` - Blockchain interaction manager
- `/contracts` - Smart contract ABIs and deployment scripts
- `/tests` - Test files

## For Administrators

1. **Verify Patent Requests**:
   - Access the admin verification page
   - Review pending patent requests
   - Approve or reject requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Ethereum](https://ethereum.org/) community for blockchain infrastructure
- [IPFS](https://ipfs.io/) and [Filebase](https://filebase.com/) for decentralized storage
- [Flask](https://flask.palletsprojects.com/) community for web framework
- [Web3.js](https://web3js.readthedocs.io/) and [Web3.py](https://web3py.readthedocs.io/) for blockchain interaction
- [Tailwind CSS](https://tailwindcss.com/) for modern UI components
